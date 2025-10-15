import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { Plus, Minus, Check } from 'lucide-react-native';

interface QuantityInputProps {
  productName: string;
  onConfirm: (quantity: number) => void;
  onCancel: () => void;
}

const QuantityInput: React.FC<QuantityInputProps> = ({ productName, onConfirm, onCancel }) => {
  const [quantity, setQuantity] = useState(1);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleConfirm = () => {
    onConfirm(quantity);
  };

  const handleCustomQuantity = () => {
    Alert.prompt(
      'Enter Quantity',
      `How many units of ${productName} would you like?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: (text) => {
            const num = parseInt(text || '1');
            if (num > 0) {
              setQuantity(num);
            }
          },
        },
      ],
      'plain-text',
      quantity.toString()
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Quantity</Text>
      <Text style={styles.productName}>{productName}</Text>
      
      <View style={styles.quantitySelector}>
        <TouchableOpacity
          style={[styles.button, quantity <= 1 && styles.buttonDisabled]}
          onPress={handleDecrement}
          disabled={quantity <= 1}
        >
          <Minus size={20} color={quantity <= 1 ? '#9ca3af' : '#6366f1'} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quantityDisplay} onPress={handleCustomQuantity}>
          <Text style={styles.quantityText}>{quantity}</Text>
          <Text style={styles.quantityLabel}>units</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleIncrement}>
          <Plus size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionButtons}>
        {/* <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity> */}
        
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Check size={16} color="#ffffff" />
          <Text style={styles.confirmButtonText}>Confirm</Text>
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    minWidth: 48,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#f9fafb',
  },
  quantityDisplay: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  quantityLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
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
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
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
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 6,
  },
});

export default QuantityInput;
