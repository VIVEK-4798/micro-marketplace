import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { favorites, toggleFavorite, logout } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: { search, page, limit: 10 },
      });
      if (reset) {
        setProducts(res.data.products);
      } else {
        setProducts((prev) => [...prev, ...res.data.products]);
      }
      setTotalPages(res.data.totalPages);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts(true);
  }, [search]);

  const loadMore = () => {
    if (page < totalPages) {
      setPage((p) => p + 1);
    }
  };

  useEffect(() => {
    if (page !== 1) fetchProducts();
  }, [page]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchProducts(true);
    setRefreshing(false);
  };

  const renderItem = ({ item }) => {
    const isFav = favorites.includes(item._id);
    return (
      <ProductCard
        product={item}
        isFavorite={isFav}
        onToggleFavorite={() => toggleFavorite(item._id)}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={search}
          onChangeText={(text) => {
            setSearch(text);
            setPage(1);
          }}
        />
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListFooterComponent={loading ? <ActivityIndicator /> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
  },
  logoutButton: {
    marginLeft: 8,
  },
  logoutText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;