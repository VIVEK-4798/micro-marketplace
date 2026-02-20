import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Loader from '../components/Loader';
import PropTypes from 'prop-types';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`/products/${id}`);
        const productData = response.data;
        
        // Check if product is in user's favorites
        if (user?.favorites?.includes(productData._id)) {
          productData.isFavorite = true;
        }
        
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(
          err.response?.status === 404 
            ? 'Product not found' 
            : 'Failed to load product. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  // Handle favorite toggle with optimistic update
  const handleFavorite = useCallback(async () => {
    if (!product || favoriteLoading) return;

    const originalFavoriteState = product.isFavorite;
    const originalUserFavorites = user?.favorites || [];

    // Optimistic update
    setProduct(prev => ({ ...prev, isFavorite: !originalFavoriteState }));
    
    if (user) {
      setUser(prev => {
        if (!prev) return prev;
        const newFavorites = originalFavoriteState
          ? prev.favorites.filter(favId => favId !== id)
          : [...prev.favorites, id];
        return { ...prev, favorites: newFavorites };
      });
    }

    setFavoriteLoading(true);

    try {
      if (!originalFavoriteState) {
        await axios.post(`/products/${id}/favorite`);
      } else {
        await axios.delete(`/products/${id}/favorite`);
      }
    } catch (err) {
      console.error('Error updating favorite:', err);
      
      // Revert optimistic updates on error
      setProduct(prev => ({ ...prev, isFavorite: originalFavoriteState }));
      
      if (user) {
        setUser(prev => {
          if (!prev) return prev;
          return { ...prev, favorites: originalUserFavorites };
        });
      }

      // Show error notification (you can replace with your toast/notification system)
      alert('Failed to update favorite. Please try again.');
    } finally {
      setFavoriteLoading(false);
    }
  }, [product, user, id, setUser, favoriteLoading]);

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  // Handle go back
  const handleGoBack = () => {
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <Loader size="large" text="Loading product details..." />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Oops!</h2>
          <p style={styles.errorMessage}>{error || 'Product not found'}</p>
          <div style={styles.errorActions}>
            <button onClick={handleGoBack} style={styles.secondaryButton}>
              Go Back
            </button>
            <button onClick={() => window.location.reload()} style={styles.primaryButton}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = imageError 
    ? 'https://via.placeholder.com/600x400?text=Image+Not+Available' 
    : (product.image || 'https://via.placeholder.com/600x400?text=No+Image');

  return (
    <div style={styles.container}>
      {/* Back button */}
      <button onClick={handleGoBack} style={styles.backButton} aria-label="Go back">
        ← Back
      </button>

      <div style={styles.content}>
        {/* Image section */}
        <div style={styles.imageSection}>
          <div style={styles.imageContainer}>
            <img
              src={imageUrl}
              alt={product.title}
              style={styles.image}
              onError={handleImageError}
              loading="lazy"
            />
          </div>
        </div>

        {/* Info section */}
        <div style={styles.infoSection}>
          <h1 style={styles.title}>{product.title}</h1>
          
          <div style={styles.priceContainer}>
            <span style={styles.priceLabel}>Price:</span>
            <span style={styles.price}>${Number(product.price).toFixed(2)}</span>
          </div>

          {product.category && (
            <div style={styles.category}>
              <span style={styles.categoryLabel}>Category:</span>
              <span style={styles.categoryValue}>{product.category}</span>
            </div>
          )}

          {product.stock !== undefined && (
            <div style={styles.stock}>
              <span style={styles.stockLabel}>Availability:</span>
              <span style={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          )}

          <div style={styles.description}>
            <h3 style={styles.descriptionTitle}>Description</h3>
            <p style={styles.descriptionText}>{product.description}</p>
          </div>

          {/* Action buttons */}
          <div style={styles.actions}>
            <button
              onClick={handleFavorite}
              style={product.isFavorite ? styles.favoriteButtonActive : styles.favoriteButton}
              disabled={favoriteLoading || !user}
              aria-label={product.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={product.isFavorite}
            >
              {favoriteLoading ? (
                <span style={styles.buttonLoader}>Updating...</span>
              ) : (
                <>
                  <span style={styles.buttonIcon}>
                    {product.isFavorite ? '❤️' : '🤍'}
                  </span>
                  {product.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </>
              )}
            </button>

            {!user && (
              <p style={styles.loginPrompt}>
                <a href="/login" style={styles.loginLink}>Login</a> to add to favorites
              </p>
            )}

            <button style={styles.buyButton} disabled={product.stock === 0}>
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
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
    padding: '20px',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '10px 0',
    marginBottom: '20px',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'color 0.2s',
    ':hover': {
      color: '#4338ca',
    },
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '40px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: '30px',
      padding: '20px',
    },
  },
  imageSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  imageContainer: {
    width: '100%',
    maxWidth: '500px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: '100%',
    height: 'auto',
    display: 'block',
    transition: 'transform 0.3s',
    ':hover': {
      transform: 'scale(1.02)',
    },
  },
  infoSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#333',
    margin: 0,
    lineHeight: 1.2,
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px 0',
    borderBottom: '1px solid #eee',
    borderTop: '1px solid #eee',
  },
  priceLabel: {
    fontSize: '1.1rem',
    color: '#666',
    fontWeight: '500',
  },
  price: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#4f46e5',
  },
  category: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  categoryLabel: {
    fontSize: '1rem',
    color: '#666',
    fontWeight: '500',
  },
  categoryValue: {
    fontSize: '1rem',
    color: '#333',
    backgroundColor: '#f0f0f0',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  stock: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  stockLabel: {
    fontSize: '1rem',
    color: '#666',
    fontWeight: '500',
  },
  inStock: {
    fontSize: '1rem',
    color: '#10b981',
    fontWeight: '600',
  },
  outOfStock: {
    fontSize: '1rem',
    color: '#ef4444',
    fontWeight: '600',
  },
  description: {
    marginTop: '10px',
  },
  descriptionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px',
  },
  descriptionText: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#666',
    margin: 0,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px',
  },
  favoriteButton: {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    border: '2px solid #4f46e5',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#4f46e5',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ':hover:not(:disabled)': {
      backgroundColor: '#4f46e5',
      color: '#fff',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  favoriteButtonActive: {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    border: '2px solid #4f46e5',
    borderRadius: '8px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ':hover:not(:disabled)': {
      backgroundColor: '#4338ca',
      borderColor: '#4338ca',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  buyButton: {
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#10b981',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover:not(:disabled)': {
      backgroundColor: '#059669',
    },
    ':disabled': {
      backgroundColor: '#d1d5db',
      cursor: 'not-allowed',
    },
  },
  buttonIcon: {
    fontSize: '1.2rem',
  },
  buttonLoader: {
    display: 'inline-block',
  },
  loginPrompt: {
    fontSize: '0.9rem',
    color: '#666',
    textAlign: 'center',
    margin: 0,
  },
  loginLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '600',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    width: '100%',
  },
  errorTitle: {
    fontSize: '2rem',
    color: '#ef4444',
    marginBottom: '10px',
  },
  errorMessage: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '20px',
  },
  errorActions: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  primaryButton: {
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
  secondaryButton: {
    padding: '10px 20px',
    backgroundColor: '#fff',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#f5f5f5',
    },
  },
};

// PropTypes for better documentation
ProductDetail.propTypes = {
  // No props expected as we use hooks
};

export default ProductDetail;