import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';


const Home = () => {
  const { token, user, setUser } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favoriteLoading, setFavoriteLoading] = useState(new Set());

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(search, 500);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Memoize favorites set for quick lookup
  const userFavorites = useMemo(() => {
    return user?.favorites ? new Set(user.favorites) : new Set();
  }, [user?.favorites]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/products', {
        params: {
          page,
          limit: 6,
          search: debouncedSearch
        },
      });

      const data = response.data;

      // Mark favorites efficiently using Set
      const productsWithFavorites = data.products.map((product) => ({
        ...product,
        isFavorite: userFavorites.has(product._id),
      }));

      setProducts(productsWithFavorites);
      setTotalPages(data.totalPages);
      setTotalProducts(data.totalProducts || 0);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(
        err.response?.status === 404
          ? 'No products found'
          : 'Failed to load products. Please try again.'
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, userFavorites]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFavorite = useCallback(async (id) => {
    // Prevent multiple clicks on same product
    if (favoriteLoading.has(id)) return;

    // Find the product to get current state
    const product = products.find(p => p._id === id);
    if (!product) return;

    const wasFavorited = product.isFavorite;

    // Add to loading set
    setFavoriteLoading(prev => new Set(prev).add(id));

    // Optimistic UI update
    setProducts(prev =>
      prev.map(p =>
        p._id === id ? { ...p, isFavorite: !wasFavorited } : p
      )
    );

    // Optimistic user update
    if (user) {
      setUser(prev => {
        if (!prev) return prev;
        const newFavorites = wasFavorited
          ? prev.favorites.filter(favId => favId !== id)
          : [...prev.favorites, id];
        return { ...prev, favorites: newFavorites };
      });
    }

    try {
      if (!wasFavorited) {
        await axios.post(`/products/${id}/favorite`);
      } else {
        await axios.delete(`/products/${id}/favorite`);
      }
    } catch (err) {
      console.error('Favorite error:', err);

      // Revert optimistic updates
      setProducts(prev =>
        prev.map(p =>
          p._id === id ? { ...p, isFavorite: wasFavorited } : p
        )
      );

      if (user) {
        setUser(prev => {
          if (!prev) return prev;
          const newFavorites = wasFavorited
            ? [...prev.favorites, id]
            : prev.favorites.filter(favId => favId !== id);
          return { ...prev, favorites: newFavorites };
        });
      }

      // Show error notification
      alert('Failed to update favorite. Please try again.');
    } finally {
      // Remove from loading set
      setFavoriteLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [products, user, setUser, favoriteLoading]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearch('');
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    fetchProducts();
  };

  // Render loading state
  if (loading && products.length === 0) {
    return (
      <div style={styles.centerContainer}>
        <Loader size="large" text="Loading products..." />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Products</h1>
        {totalProducts > 0 && (
          <p style={styles.productCount}>{totalProducts} products available</p>
        )}
      </div>

      {/* Search Section */}
      <div style={styles.searchSection}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearchChange}
            style={styles.searchInput}
            aria-label="Search products"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              style={styles.clearButton}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <div style={styles.searchIcon} aria-hidden="true">
          🔍
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div style={styles.errorContainer}>
          <p style={styles.errorMessage}>{error}</p>
          <button onClick={handleRetry} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!error && (
        <>
          {products.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyStateText}>No products found.</p>
              {search && (
                <button onClick={handleClearSearch} style={styles.clearSearchButton}>
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={styles.grid}>
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onFavorite={handleFavorite}
                    isLoading={favoriteLoading.has(product._id)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}

              {/* Results info */}
              <div style={styles.resultsInfo}>
                Showing page {page} of {totalPages}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

// Styles object
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    minHeight: 'calc(100vh - 200px)',
  },
  centerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 200px)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#333',
    margin: 0,
  },
  productCount: {
    fontSize: '1rem',
    color: '#666',
    backgroundColor: '#f0f0f0',
    padding: '4px 12px',
    borderRadius: '20px',
    margin: 0,
  },
  searchSection: {
    position: 'relative',
    marginBottom: '30px',
  },
  searchContainer: {
    position: 'relative',
    width: '100%',
  },
  searchInput: {
    width: '100%',
    padding: '14px 40px 14px 45px',
    fontSize: '1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '12px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    ':focus': {
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
  },
  searchIcon: {
    position: 'absolute',
    left: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#999',
    fontSize: '1.2rem',
  },
  clearButton: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: '#999',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f0f0f0',
      color: '#666',
    },
  },
  grid: {
    display: 'grid',
    gap: '24px',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    marginBottom: '30px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
  },
  emptyStateText: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '20px',
  },
  clearSearchButton: {
    padding: '10px 20px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#4338ca',
    },
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #fee2e2',
  },
  errorMessage: {
    fontSize: '1.1rem',
    color: '#dc2626',
    marginBottom: '20px',
  },
  retryButton: {
    padding: '10px 20px',
    backgroundColor: '#dc2626',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#b91c1c',
    },
  },
  resultsInfo: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#999',
    marginTop: '20px',
  },
};

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default Home;