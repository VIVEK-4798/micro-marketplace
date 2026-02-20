import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductCard = ({ product, onPress, isFavorite, onToggleFavorite }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text>No Image</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>${product.price}</Text>
      </View>
      <TouchableOpacity
        style={styles.favButton}
        onPress={onToggleFavorite}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={24}
          color={isFavorite ? 'red' : 'gray'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  info: {
    padding: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
});

export default ProductCard;