import React from 'react';

const Loader = () => (
  <div style={styles.loader}>
    <div className="spinner" style={styles.spinner}></div>
  </div>
);

const styles = {
  loader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '50px 0',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #ccc',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default Loader;