import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProductCard = memo(({ product, onFavorite }) => {
  const { _id, title, price, description, image, isFavorite } = product;
  
  const handleFavoriteClick = (e) => {
    e.preventDefault(); // Prevent navigation when clicking favorite button
    e.stopPropagation(); // Stop event bubbling
    onFavorite(_id);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFavorite(_id);
    }
  };

  return (
    <article style={styles.card} aria-label={`Product: ${title}`}>
      <Link to={`/products/${_id}`} style={styles.link} aria-label={`View ${title} details`}>
        <div style={styles.imageContainer}>
          <img
            src={image || DEFAULT_IMAGE}
            alt={title}
            style={styles.image}
            loading="lazy"
            onError={(e) => {
              e.target.src = DEFAULT_IMAGE;
              e.target.alt = 'Product image not available';
            }}
          />
        </div>
        <div style={styles.content}>
          <h3 style={styles.title}>{title}</h3>
          <p style={styles.price}>${Number(price).toFixed(2)}</p>
          {description && (
            <p style={styles.description}>
              {description.length > 60 
                ? `${description.substring(0, 60)}...` 
                : description
              }
            </p>
          )}
        </div>
      </Link>
      
      <button
        onClick={handleFavoriteClick}
        onKeyDown={handleKeyDown}
        style={getHeartStyle(isFavorite)}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={isFavorite}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <span aria-hidden="true">{isFavorite ? '❤️' : '🤍'}</span>
      </button>
      
      {isFavorite && (
        <div style={styles.favoriteBadge} aria-hidden="true" />
      )}
    </article>
  );
});

// Default image constant
const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=No+Image';

// Styles object
const styles = {
  card: {
    position: 'relative',
    background: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  imageContainer: {
    width: '100%',
    paddingTop: '66.67%', // 3:2 aspect ratio
    position: 'relative',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'scale(1.05)',
    },
  },
  content: {
    padding: '16px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
    lineHeight: '1.4',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  price: {
    margin: '0 0 8px 0',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#4f46e5',
  },
  description: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#666',
    lineHeight: '1.5',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  favoriteBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    pointerEvents: 'none',
    zIndex: 0,
  },
};

// Dynamic style function for heart button
const getHeartStyle = (isFavorite) => ({
  position: 'absolute',
  top: '12px',
  right: '12px',
  width: '36px',
  height: '36px',
  background: 'rgba(255, 255, 255, 0.9)',
  border: 'none',
  borderRadius: '50%',
  fontSize: '1.2rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: isFavorite ? 'scale(1.1)' : 'scale(1)',
  transition: 'transform 0.2s ease, background-color 0.2s ease',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  zIndex: 1,
  padding: 0,
  lineHeight: 1,
  ':hover': {
    transform: 'scale(1.15)',
    backgroundColor: '#ffffff',
  },
  ':focus': {
    outline: '2px solid #4f46e5',
    outlineOffset: '2px',
  },
  ':focus:not(:focus-visible)': {
    outline: 'none',
  },
});

// PropTypes for better documentation and type checking
ProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    description: PropTypes.string,
    image: PropTypes.string,
    isFavorite: PropTypes.bool,
  }).isRequired,
  onFavorite: PropTypes.func.isRequired,
};

// Display name for debugging
ProductCard.displayName = 'ProductCard';

export default ProductCard;