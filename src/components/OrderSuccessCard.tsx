import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CheckCircle, MapPin, Package } from 'lucide-react-native';
import { Product } from '../services/OrderBotAPI';

interface OrderSuccessCardProps {
  products: Product[];
  address: string;
  message: string;
}

const OrderSuccessCard: React.FC<OrderSuccessCardProps> = ({ products, address, message }) => {
  return (
    <View style={styles.card}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <CheckCircle size={32} color="#059669" />
        <Text style={styles.successTitle}>Order Successful!</Text>
      </View>

      {/* Success Message */}
      <Text style={styles.successMessage}>{message}</Text>

      {/* Order Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>

        {/* Products */}
        <View style={styles.productsContainer}>
          {products.map((product, index) => (
            <View key={index} style={styles.productItem}>
              <View style={styles.productHeader}>
                <Package size={16} color="#6366f1" />
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
              </View>
              <View style={styles.productDetails}>
                <Text style={styles.productDescription}>
                  {product.description}
                </Text>
                <Text style={styles.productQuantity}>
                  Quantity: {product.quantity_or_weight}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={styles.addressContainer}>
          <MapPin size={16} color="#ef4444" />
          <Text style={styles.addressTitle}>Delivery Address</Text>
        </View>
        <Text style={styles.addressText}>{address}</Text>
      </View>

      {/* Complete Button */}
      {/* <TouchableOpacity style={styles.completeButton}>
        <Text style={styles.completeButtonText}>Complete Order</Text>
      </TouchableOpacity> */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 4,
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
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
    marginLeft: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  summaryContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  productsContainer: {
    marginBottom: 16,
  },
  productItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 6,
    flex: 1,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDescription: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  productQuantity: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 6,
  },
  addressText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    paddingLeft: 22,
  },
  completeButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderSuccessCard;
