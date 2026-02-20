import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  // Check for registration success message
  const registrationMessage = location.state?.message;

  // Clear error when user types
  useEffect(() => {
    if (error) setError('');
  }, [email, password]);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      
      // If remember me is checked, you can implement persistent login
      if (rememberMe) {
        // You can set a longer token expiry here
        localStorage.setItem('rememberMe', 'true');
      }
      
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle different error scenarios
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError('Invalid email or password');
            break;
          case 403:
            setError('Your account has been locked. Please contact support.');
            break;
          case 429:
            setError('Too many login attempts. Please try again later.');
            break;
          default:
            setError(err.response.data?.message || 'Login failed. Please try again.');
        }
      } else if (err.request) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password page
    navigate('/forgot-password');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Please enter your details to sign in</p>
      </div>

      {/* Registration success message */}
      {registrationMessage && (
        <div style={styles.successMessage}>
          {registrationMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={styles.errorContainer} role="alert">
          <span style={styles.errorIcon}>⚠️</span>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        {/* Email field */}
        <div style={styles.inputGroup}>
          <label htmlFor="email" style={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            placeholder="Enter your email"
            disabled={loading}
            required
            aria-label="Email address"
            autoComplete="email"
            autoFocus
          />
        </div>

        {/* Password field */}
        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>
            Password
          </label>
          <div style={styles.passwordContainer}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.passwordInput}
              placeholder="Enter your password"
              disabled={loading}
              required
              aria-label="Password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={styles.passwordToggle}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        {/* Remember me & Forgot password */}
        <div style={styles.optionsRow}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              style={styles.checkbox}
            />
            <span style={styles.checkboxText}>Remember me</span>
          </label>
          <button
            type="button"
            onClick={handleForgotPassword}
            style={styles.forgotPassword}
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          style={{
            ...styles.button,
            ...(loading && styles.buttonDisabled)
          }}
          disabled={loading}
        >
          {loading ? (
            <span style={styles.buttonContent}>
              <span style={styles.spinner}></span>
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Register link */}
      <div style={styles.footer}>
        <p style={styles.linkText}>
          Don't have an account?{' '}
          <Link 
            to="/register" 
            style={styles.link}
            state={{ from: location.state?.from }}
          >
            Create an account
          </Link>
        </p>
      </div>

      {/* Demo credentials (optional - for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={styles.demoCredentials}>
          <p style={styles.demoTitle}>Demo Credentials:</p>
          <p style={styles.demoText}>Email: demo@example.com</p>
          <p style={styles.demoText}>Password: password123</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '32px',
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '12px 14px',
    fontSize: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s',
    ':focus': {
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
    ':disabled': {
      backgroundColor: '#f5f5f5',
      cursor: 'not-allowed',
    },
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    width: '100%',
    padding: '12px 14px',
    fontSize: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s',
    paddingRight: '45px',
    boxSizing: 'border-box',
    ':focus': {
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
    ':disabled': {
      backgroundColor: '#f5f5f5',
      cursor: 'not-allowed',
    },
  },
  passwordToggle: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    transition: 'color 0.2s',
    ':hover:not(:disabled)': {
      color: '#333',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '5px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#4f46e5',
  },
  checkboxText: {
    fontSize: '14px',
    color: '#666',
  },
  forgotPassword: {
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '5px',
    transition: 'color 0.2s',
    ':hover:not(:disabled)': {
      color: '#4338ca',
      textDecoration: 'underline',
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  button: {
    padding: '14px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#4f46e5',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '10px',
    ':hover:not(:disabled)': {
      backgroundColor: '#4338ca',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
    },
    ':active:not(:disabled)': {
      transform: 'translateY(0)',
    },
  },
  buttonDisabled: {
    backgroundColor: '#a5a5a5',
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: '#a5a5a5',
      transform: 'none',
      boxShadow: 'none',
    },
  },
  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid #ffffff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  errorIcon: {
    fontSize: '16px',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '14px',
    margin: 0,
    flex: 1,
  },
  successMessage: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: '10px',
    padding: '12px',
    marginBottom: '20px',
    color: '#166534',
    fontSize: '14px',
    textAlign: 'center',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
  },
  linkText: {
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#4f46e5',
    fontWeight: '600',
    textDecoration: 'none',
    marginLeft: '4px',
    transition: 'color 0.2s',
    ':hover': {
      color: '#4338ca',
      textDecoration: 'underline',
    },
  },
  demoCredentials: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px dashed #cbd5e1',
  },
  demoTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '8px',
  },
  demoText: {
    fontSize: '12px',
    color: '#64748b',
    margin: '4px 0',
    fontFamily: 'monospace',
  },
};

// Add keyframes for spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default Login;