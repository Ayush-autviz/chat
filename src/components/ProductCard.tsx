import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { ShoppingCart, Package } from 'lucide-react-native';
import { Product } from '../services/OrderBotAPI';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  intent?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, intent }) => {
  const isAddressCapture = intent === 'address_capture' || intent === 'order_placement';
  
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => !isAddressCapture && onSelect(product)}
      activeOpacity={isAddressCapture ? 1 : 0.7}
    >
      <View style={styles.cardHeader}>
        <Package size={20} color="#6366f1" />
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>
        {product.quantity_or_weight}
      </Text>

      
      
      <View style={styles.cardFooter}>
        {product.price && (
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price:</Text>
            <Text style={styles.price}>
              {product.price === 'unknown' ? 'Contact for price' : product.price}
            </Text>
          </View>
        )}
        
        {product.available_quantity && (
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Available:</Text>
            <Text style={styles.quantity}>
              {product.available_quantity === 'unknown' ? 'Check availability' : product.available_quantity}
            </Text>
          </View>
        )}

        {product.quantity && (
          <View style={styles.selectedQuantityContainer}>
            <Text style={styles.selectedQuantityLabel}>Selected:</Text>
            <Text style={styles.selectedQuantity}>{product.quantity} units</Text>
          </View>
        )}
      </View>
      
      {!isAddressCapture ? (
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => onSelect(product)}
        >
          <ShoppingCart size={16} color="#ffffff" />
          <Text style={styles.selectButtonText}>Select Product</Text>
        </TouchableOpacity>
      ) : (
        <View >
          {/* <Text style={styles.confirmationText}>Confirm Order</Text> */}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  price: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  quantityContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  quantityLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  quantity: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  selectedQuantityContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  selectedQuantityLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  selectedQuantity: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  confirmationContainer: {
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  confirmationText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProductCard;
