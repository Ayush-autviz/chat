import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { MapPin, Check, X } from 'lucide-react-native';

interface AddressInputProps {
  onConfirm: (address: string) => void;
  onCancel: () => void;
}

const AddressInput: React.FC<AddressInputProps> = ({ onConfirm, onCancel }) => {
  const [address, setAddress] = useState('');

  const handleConfirm = () => {
    if (address.trim()) {
      onConfirm(address.trim());
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MapPin size={20} color="#6366f1" />
        <Text style={styles.title}>Delivery Address</Text>
      </View>
      
      <Text style={styles.subtitle}>
        Please provide your complete delivery address
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your delivery address..."
        value={address}
        onChangeText={setAddress}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
      
      <View style={styles.actionButtons}>
        {/* <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <X size={16} color="#6b7280" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity> */}
        
        <TouchableOpacity 
          style={[styles.confirmButton, !address.trim() && styles.confirmButtonDisabled]} 
          onPress={handleConfirm}
          disabled={!address.trim()}
        >
          <Check size={16} color="#ffffff" />
          <Text style={styles.confirmButtonText}>Confirm Address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#f8fafc',
    minHeight: 80,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    marginLeft: 6,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 12,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  confirmButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
  },
});

export default AddressInput;
