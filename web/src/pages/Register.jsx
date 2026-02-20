import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state
  const from = location.state?.from?.pathname || '/login';

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.trim().length > 50) return 'Name must be less than 50 characters';
        return '';
      
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email address';
        return '';
      
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        if (value.length > 50) return 'Password must be less than 50 characters';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        return '';
      
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, formData[name]);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.error-text');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      navigate(from, { 
        state: { 
          message: 'Registration successful! Please check your email to verify your account.' 
        } 
      });
    } catch (err) {
      console.error('Registration error:', err);
      
      // Handle different error scenarios
      if (err.response) {
        switch (err.response.status) {
          case 400:
            if (err.response.data.errors) {
              // Handle validation errors from server
              const serverErrors = {};
              err.response.data.errors.forEach(error => {
                serverErrors[error.param] = error.msg;
              });
              setErrors(serverErrors);
            } else {
              setErrors({ form: err.response.data?.message || 'Registration failed' });
            }
            break;
          case 409:
            setErrors({ email: 'An account with this email already exists' });
            break;
          default:
            setErrors({ form: 'Registration failed. Please try again.' });
        }
      } else if (err.request) {
        setErrors({ form: 'Cannot connect to server. Please check your internet connection.' });
      } else {
        setErrors({ form: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, text: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++;
    
    strength = Math.min(5, Math.floor(strength / 2));
    
    const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColor = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
    
    return {
      strength,
      text: strengthText[strength],
      color: strengthColor[strength],
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join us to start shopping</p>
      </div>

      {/* Form error */}
      {errors.form && (
        <div style={styles.errorContainer} role="alert">
          <span style={styles.errorIcon}>⚠️</span>
          <p style={styles.errorText}>{errors.form}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form} noValidate>
        {/* Name field */}
        <div style={styles.inputGroup}>
          <label htmlFor="name" style={styles.label}>
            Full Name <span style={styles.required}>*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{
              ...styles.input,
              ...(touched.name && errors.name ? styles.inputError : {})
            }}
            placeholder="Enter your full name"
            disabled={loading}
            required
            aria-label="Full name"
            autoComplete="name"
            autoFocus
          />
          {touched.name && errors.name && (
            <p style={styles.fieldError}>{errors.name}</p>
          )}
        </div>

        {/* Email field */}
        <div style={styles.inputGroup}>
          <label htmlFor="email" style={styles.label}>
            Email <span style={styles.required}>*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            style={{
              ...styles.input,
              ...(touched.email && errors.email ? styles.inputError : {})
            }}
            placeholder="Enter your email"
            disabled={loading}
            required
            aria-label="Email address"
            autoComplete="email"
          />
          {touched.email && errors.email && (
            <p style={styles.fieldError}>{errors.email}</p>
          )}
        </div>

        {/* Password field */}
        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>
            Password <span style={styles.required}>*</span>
          </label>
          <div style={styles.passwordContainer}>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{
                ...styles.passwordInput,
                ...(touched.password && errors.password ? styles.inputError : {})
              }}
              placeholder="Create a password"
              disabled={loading}
              required
              aria-label="Password"
              autoComplete="new-password"
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
          
          {/* Password strength indicator */}
          {formData.password && !errors.password && (
            <div style={styles.strengthContainer}>
              <div style={styles.strengthBar}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    style={{
                      ...styles.strengthSegment,
                      backgroundColor: level <= passwordStrength.strength 
                        ? passwordStrength.color 
                        : '#e0e0e0',
                    }}
                  />
                ))}
              </div>
              <span style={{ ...styles.strengthText, color: passwordStrength.color }}>
                {passwordStrength.text}
              </span>
            </div>
          )}
          
          {touched.password && errors.password && (
            <p style={styles.fieldError}>{errors.password}</p>
          )}
          
          <ul style={styles.passwordRequirements}>
            <li style={formData.password.length >= 6 ? styles.requirementMet : styles.requirement}>
              At least 6 characters
            </li>
            <li style={/(?=.*[a-z])/.test(formData.password) ? styles.requirementMet : styles.requirement}>
              One lowercase letter
            </li>
            <li style={/(?=.*[A-Z])/.test(formData.password) ? styles.requirementMet : styles.requirement}>
              One uppercase letter
            </li>
            <li style={/(?=.*\d)/.test(formData.password) ? styles.requirementMet : styles.requirement}>
              One number
            </li>
          </ul>
        </div>

        {/* Confirm Password field */}
        <div style={styles.inputGroup}>
          <label htmlFor="confirmPassword" style={styles.label}>
            Confirm Password <span style={styles.required}>*</span>
          </label>
          <div style={styles.passwordContainer}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{
                ...styles.passwordInput,
                ...(touched.confirmPassword && errors.confirmPassword ? styles.inputError : {})
              }}
              placeholder="Confirm your password"
              disabled={loading}
              required
              aria-label="Confirm password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              style={styles.passwordToggle}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              disabled={loading}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <p style={styles.fieldError}>{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms and conditions */}
        <div style={styles.termsContainer}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                if (errors.terms) {
                  setErrors(prev => ({ ...prev, terms: '' }));
                }
              }}
              disabled={loading}
              style={styles.checkbox}
            />
            <span style={styles.checkboxText}>
              I agree to the{' '}
              <Link to="/terms" style={styles.termsLink} target="_blank">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" style={styles.termsLink} target="_blank">
                Privacy Policy
              </Link>
              <span style={styles.required}>*</span>
            </span>
          </label>
          {errors.terms && (
            <p style={styles.fieldError}>{errors.terms}</p>
          )}
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
              Creating Account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Login link */}
      <div style={styles.footer}>
        <p style={styles.linkText}>
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={styles.link}
            state={{ from: location.state?.from }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '450px',
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
  required: {
    color: '#ef4444',
    marginLeft: '2px',
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
  inputError: {
    borderColor: '#ef4444',
    ':focus': {
      borderColor: '#ef4444',
      boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
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
  strengthContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '4px',
  },
  strengthBar: {
    display: 'flex',
    gap: '4px',
    flex: 1,
  },
  strengthSegment: {
    height: '4px',
    flex: 1,
    borderRadius: '2px',
    transition: 'background-color 0.2s',
  },
  strengthText: {
    fontSize: '12px',
    fontWeight: '500',
    minWidth: '70px',
  },
  passwordRequirements: {
    margin: '8px 0 0',
    padding: '0 0 0 20px',
    fontSize: '12px',
    color: '#666',
    listStyle: 'none',
  },
  requirement: {
    color: '#999',
    marginBottom: '4px',
    position: 'relative',
    ':before': {
      content: '"○"',
      position: 'absolute',
      left: '-16px',
      color: '#999',
    },
  },
  requirementMet: {
    color: '#10b981',
    marginBottom: '4px',
    position: 'relative',
    ':before': {
      content: '"●"',
      position: 'absolute',
      left: '-16px',
      color: '#10b981',
    },
  },
  termsContainer: {
    marginTop: '10px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginTop: '2px',
    cursor: 'pointer',
    accentColor: '#4f46e5',
  },
  checkboxText: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.4',
  },
  termsLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500',
    ':hover': {
      textDecoration: 'underline',
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
  fieldError: {
    color: '#ef4444',
    fontSize: '12px',
    margin: '4px 0 0',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    borderTop: '1px solid #e0e0e0',
    paddingTop: '24px',
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

export default Register;