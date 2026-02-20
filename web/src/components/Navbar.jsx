import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        Micro Marketplace
      </Link>
      {user && (
        <button onClick={handleLogout} style={styles.button}>
          Logout
        </button>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    padding: '10px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logo: {
    textDecoration: 'none',
    color: '#4f46e5',
    fontWeight: 'bold',
    fontSize: '18px',
  },
  button: {
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default Navbar;