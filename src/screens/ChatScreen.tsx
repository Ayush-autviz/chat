import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Send,
  Image as ImageIcon,
  Mic,
  MicOff,
  Bot,
  User,
  Paperclip,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
} from 'lucide-react-native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import Sound, {
  RecordBackType,
  PlayBackType,
} from 'react-native-nitro-sound';
import OrderBotAPI, { OrderBotResponse, Product } from '../services/OrderBotAPI';
import ProductCard from '../components/ProductCard';
import QuantityInput from '../components/QuantityInput';
import AddressInput from '../components/AddressInput';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text?: string;
  image?: string;
  isVoice?: boolean;
  voiceUri?: string;
  voiceDuration?: number;
  isUser: boolean;
  timestamp: Date;
  apiResponse?: OrderBotResponse;
  isLoading?: boolean;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI order assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [showQuantityInput, setShowQuantityInput] = useState(false);
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const requestOtherPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        // Base permissions (for audio + camera)
        const permissions = [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ];
  
        // Add correct storage/media permissions depending on Android version
        if (Platform.Version < 33) {
          // For Android 12 and below
          permissions.push(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          );
        } else {
          // For Android 13+ (API 33+)
          permissions.push(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
          );
        }
  
        // Request all permissions together
        const granted = await PermissionsAndroid.requestMultiple(permissions);
  
        console.log('Permission results:', granted);
  
        // Return true only if all are granted
        const allGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );
  
        return allGranted;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
  
    // iOS automatically handles permissions
    return true;
  };
  // Request permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Audio Recording Permission',
            message: 'This app needs access to your microphone to record audio.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
  
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true; // iOS handles it automatically
  };

  const sendMessage = async (text?: string, image?: string, isVoice?: boolean, voiceUri?: string, voiceDuration?: number) => {
    if (!text && !image && !isVoice) return;

    console.log('Sending message with thread_id:', threadId);

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      image,
      isVoice,
      voiceUri,
      voiceDuration,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Processing your request...',
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      let apiResponse: OrderBotResponse;
      
      if (text) {
        apiResponse = await OrderBotAPI.sendTextMessage(text, threadId || undefined);
      } else if (image) {
        apiResponse = await OrderBotAPI.sendImageMessage(image, threadId || undefined);
      } else if (isVoice && voiceUri) {
        apiResponse = await OrderBotAPI.sendVoiceMessage(voiceUri, threadId || undefined);
      } else {
        throw new Error('Invalid message type');
      }

      console.log('API Response received:', apiResponse);

      // Capture thread_id from the first response
      if (apiResponse.thread_id && !threadId) {
        setThreadId(apiResponse.thread_id);
        console.log('Thread ID captured:', apiResponse.thread_id);
      }

      // Replace loading message with actual response
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: apiResponse.assistant_response.message || 'Response received',
        isUser: false,
        timestamp: new Date(),
        apiResponse,
        isLoading: false,
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id ? botResponse : msg
        )
      );
    } catch (error) {
      console.error('API Error:', error);
      
      // Replace loading message with error
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        isUser: false,
        timestamp: new Date(),
        isLoading: false,
      };

      setMessages(prev => 
        prev.map(msg => 
          msg.id === loadingMessage.id ? errorResponse : msg
        )
      );
    }
  };

  const handleProductSelect = (product: Product) => {
    // Check if this is a quantity selection step
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.apiResponse?.assistant_response?.intent === 'quantity_selection') {
      setSelectedProduct(product);
      setShowQuantityInput(true);
    } else {
      sendMessage(`I want to buy this: ${product.name}`);
    }
  };

  const handleQuantityConfirm = (quantity: number) => {
    // if (selectedProduct) {
      sendMessage(`${quantity} units`);
      setShowQuantityInput(false);
      setSelectedProduct(null);
    // }
  };

  const handleQuantityCancel = () => {
    setShowQuantityInput(false);
    setSelectedProduct(null);
  };

  const handleAddressConfirm = (address: string) => {
    sendMessage(address);
    setShowAddressInput(false);
  };

  const handleAddressCancel = () => {
    setShowAddressInput(false);
  };

  const handlePlaceOrder = () => {
    sendMessage('place my order');
  };

  const startNewConversation = () => {
    setThreadId(null);
    setMessages([
      {
        id: '1',
        text: 'Hello! I\'m your AI order assistant. How can I help you today?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendText = () => {
    if (inputText.trim()) {
      sendMessage(inputText.trim());
    }
  };

  const handleImagePicker = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Please grant camera and storage permissions to use this feature.');
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as const,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        sendMessage(undefined, asset.uri);
      }
    });
  };

  const handleVoiceRecord = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Please grant microphone permission to record voice messages.');
      return;
    }

    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setRecordingDuration(0);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      try {
        const result = await Sound.stopRecorder();
        Sound.removeRecordBackListener();
        if (result) {
          sendMessage(undefined, undefined, true, result, Math.floor(recordingDuration));
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        Alert.alert('Error', 'Failed to stop recording');
      }
    } else {
      // Start recording
      try {
        // Set up recording progress listener
        Sound.addRecordBackListener((e: RecordBackType) => {
          setRecordingDuration(Math.floor(e.currentPosition / 1000));
        });

        const result = await Sound.startRecorder();
        setIsRecording(true);
        setRecordingDuration(0);
      } catch (error) {
        console.error('Error starting recording:', error);
        Alert.alert('Error', 'Failed to start recording');
      }
    }
  };

  const handlePlayVoice = async (messageId: string, voiceUri: string) => {
    try {
      if (isPlaying === messageId) {
        // Stop playing
        Sound.stopPlayer();
        Sound.removePlayBackListener();
        setIsPlaying(null);
      } else {
        // Start playing
        if (isPlaying) {
          Sound.stopPlayer();
          Sound.removePlayBackListener();
        }
        
        // Set up playback progress listener
        Sound.addPlayBackListener((e: PlayBackType) => {
          if (e.currentPosition === e.duration) {
            setIsPlaying(null);
            Sound.removePlayBackListener();
          }
        });

        const result = await Sound.startPlayer(voiceUri);
        setIsPlaying(messageId);
      }
    } catch (error) {
      console.error('Error playing voice:', error);
      Alert.alert('Error', 'Failed to play voice message');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      // Cleanup Sound listeners
      Sound.removeRecordBackListener();
      Sound.removePlayBackListener();
    };
  }, []);

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View style={styles.messageHeader}>
        {message.isUser ? (
          <User size={20} color="#6366f1" />
        ) : (
          <Bot size={20} color="#10b981" />
        )}
        <Text style={styles.messageSender}>
          {message.isUser ? 'You' : 'Order Bot'}
        </Text>
      </View>
      
      {message.image && (
        <Image source={{ uri: message.image }} style={styles.messageImage} />
      )}
      
      {message.isVoice && (
        <TouchableOpacity
          style={styles.voiceMessage}
          onPress={() => message.voiceUri && handlePlayVoice(message.id, message.voiceUri)}
        >
          {isPlaying === message.id ? (
            <Pause size={16} color="#6366f1" />
          ) : (
            <Play size={16} color="#6366f1" />
          )}
          <Text style={styles.voiceText}>
            {isPlaying === message.id ? 'Playing...' : 'Voice message'}
          </Text>
          {message.voiceDuration && (
            <Text style={styles.voiceDuration}>
              {Math.floor(message.voiceDuration / 60)}:{(message.voiceDuration % 60).toString().padStart(2, '0')}
            </Text>
          )}
        </TouchableOpacity>
      )}
      
      {message.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6366f1" />
          <Text style={styles.loadingText}>{message.text}</Text>
        </View>
      ) : (
        <>
          {message.text && (
            <Text style={styles.messageText}>{message.text}</Text>
          )}
          
          {message.apiResponse?.assistant_response?.products && 
           message.apiResponse.assistant_response.products.length > 0 && 
           (message.apiResponse.assistant_response.intent === 'product_inquiry' || 
            message.apiResponse.assistant_response.intent === 'address_capture' ||
            message.apiResponse.assistant_response.intent === 'order_placement') && (
            <View style={styles.productsContainer}>
              {/* <Text style={styles.productsTitle}>
                {message.apiResponse.assistant_response.intent === 'address_capture' || 'order_placement' || "product_query"
                  ? 'Order Summary:' 
                  : 'Available Products:'}
              </Text> */}
              {message.apiResponse?.assistant_response?.products.map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                  onSelect={handleProductSelect}
                  intent={message.apiResponse?.assistant_response?.intent}
                />
              ))}
            </View>
          )}

          {/* Show quantity input for quantity_selection intent */}
          {message.apiResponse?.assistant_response?.intent === 'quantity_selection' && 
           message.apiResponse.assistant_response.products && 
           message.apiResponse.assistant_response.products.length > 0 && (
            <QuantityInput
              productName={message.apiResponse.assistant_response.products[0].name}
              onConfirm={handleQuantityConfirm}
              onCancel={handleQuantityCancel}
            />
          )}

          {/* Show address input for order_confirmation intent */}
          {message.apiResponse?.assistant_response?.intent === 'order_confirmation' && (
            <AddressInput
              onConfirm={handleAddressConfirm}
              onCancel={handleAddressCancel}
            />
          )}

          {/* Show place order button for address_capture intent */}
          {message.apiResponse?.assistant_response?.intent === 'address_capture'  && (
            <TouchableOpacity
              style={styles.placeOrderButton}
              onPress={handlePlaceOrder}
            >
              <CheckCircle size={20} color="#ffffff" />
              <Text style={styles.placeOrderButtonText}>Place My Order</Text>
            </TouchableOpacity>
          )}
                    {message.apiResponse?.assistant_response?.intent === 'order_placement'  && (
            <TouchableOpacity
              style={styles.placeOrderButton}
              onPress={handlePlaceOrder}
            >
              <CheckCircle size={20} color="#ffffff" />
              <Text style={styles.placeOrderButtonText}>Place My Order</Text>
            </TouchableOpacity>
          )}
        </>
      )}
      
      <Text style={styles.messageTime}>
        {message.timestamp.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Bot size={24} color="#6366f1" />
            <Text style={styles.headerTitle}>Order Bot</Text>
            {threadId && (
              <TouchableOpacity
                style={styles.newConversationButton}
                onPress={startNewConversation}
              >
                <RotateCcw size={16} color="#6366f1" />
                <Text style={styles.newConversationText}>New</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
        >
          {messages.map(renderMessage)}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            {/* <TouchableOpacity
              style={styles.attachButton}
              onPress={handleImagePicker}
            >
              <Paperclip size={20} color="#6b7280" />
            </TouchableOpacity> */}
            
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            
            <TouchableOpacity
              style={[
                styles.voiceButton,
                isRecording && styles.voiceButtonActive,
              ]}
              onPress={handleVoiceRecord}
            >
              {isRecording ? (
                <MicOff size={20} color="#ffffff" />
              ) : (
                <Mic size={20} color="#6b7280" />
              )}
            </TouchableOpacity>
            
            {isRecording && (
              <Text style={styles.recordingDuration}>
                {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')}
              </Text>
            )}
            
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendText}
              disabled={!inputText.trim()}
            >
              <Send size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  newConversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newConversationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: width * 0.8,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginVertical: 4,
  },
  voiceMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    minWidth: 120,
  },
  voiceText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  voiceDuration: {
    fontSize: 12,
    color: '#9ca3af',
    marginLeft: 8,
  },
  recordingDuration: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
    minWidth: 40,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  productsContainer: {
    marginTop: 8,
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  placeOrderButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeOrderButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f8fafc',
  },
  voiceButton: {
    padding: 8,
    marginLeft: 8,
    marginRight: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#ef4444',
    borderRadius: 20,
  },
  sendButton: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
    padding: 8,
    opacity: 1,
  },
});

export default ChatScreen;
