import React, { useContext, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const ProductDetailScreen = ({ route }) => {
  const { product } = route.params;
  const { favorites, toggleFavorite } = useContext(AuthContext);
  const isFav = favorites.includes(product._id);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text>No Image</Text>
        </View>
      )}
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{product.title}</Text>
          <TouchableOpacity onPress={() => toggleFavorite(product._id)}>
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={28}
              color={isFav ? 'red' : 'gray'}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.price}>${product.price}</Text>
        <Text style={styles.description}>{product.description}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 16, backgroundColor: '#f5f5f5' },
  image: { width: '100%', height: 250 },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  info: { padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold', flex: 1, marginRight: 8 },
  price: { fontSize: 20, color: '#555', marginVertical: 8 },
  description: { fontSize: 16, color: '#333' },
});

export default ProductDetailScreen;