import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div style={styles.container}>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          style={p === currentPage ? styles.active : styles.button}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

const styles = {
  container: { margin: '20px 0', textAlign: 'center' },
  button: {
    margin: '0 5px',
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    cursor: 'pointer',
  },
  active: {
    margin: '0 5px',
    padding: '5px 10px',
    borderRadius: '6px',
    border: '1px solid #4f46e5',
    background: '#4f46e5',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default Pagination;