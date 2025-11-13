import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

function Login({ setUser }) {
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleGoogleLogin = () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/verify-otp', 
        { email: pendingEmail, otp },
        { withCredentials: true, timeout: 15000 }
      );

      localStorage.setItem('token', response.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      setUser(response.data.user);
      window.location.href = '/dashboard';
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else {
        setError(err.response?.data?.error || 'OTP verification failed');
      }
      setLoading(false);
    }
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', loginData, {
        withCredentials: true,
        timeout: 15000
      });

      if (response.data.requiresOTP) {
        setRequiresOTP(true);
        setPendingEmail(loginData.email);
        setLoginData({ email: '', password: '' });
      } else {
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError(err.response?.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/signup', signupData, {
        withCredentials: true,
        timeout: 15000
      });

      if (response.data.requiresOTP) {
        setRequiresOTP(true);
        setPendingEmail(signupData.email);
        setSignupData({ username: '', email: '', password: '', confirmPassword: '' });
      } else {
        localStorage.setItem('token', response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        setUser(response.data.user);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else if (err.response?.status === 400) {
        setError(err.response.data.error);
      } else {
        setError(err.response?.data?.error || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (requiresOTP) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Verify OTP</h1>
          <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#718096' }}>
            Enter the OTP sent to {pendingEmail}
          </p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                disabled={loading}
                maxLength="6"
                required
              />
            </div>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <button
            onClick={() => {
              setRequiresOTP(false);
              setOtp('');
              setPendingEmail('');
              setError('');
            }}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'transparent',
              border: '2px solid #667eea',
              color: '#667eea',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome to Blog App</h1>

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {activeTab === 'login' ? (
          <div className="tab-content">
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group password-group">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  disabled={loading}
                >
                  {showLoginPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            {process.env.NODE_ENV !== 'production' && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Link to="/forgot-password" style={{ color: '#667eea', textDecoration: 'none', fontSize: '0.9rem' }}>
                  Forgot Password?
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="tab-content">
            <form onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={signupData.username}
                  onChange={handleSignupChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  disabled={loading}
                  required
                />
              </div>
              <div className="form-group password-group">
                <input
                  type={showSignupPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password (min 6 chars)"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  disabled={loading}
                >
                  {showSignupPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <div className="form-group password-group">
                <input
                  type={showSignupConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={signupData.confirmPassword}
                  onChange={handleSignupChange}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowSignupConfirm(!showSignupConfirm)}
                  disabled={loading}
                >
                  {showSignupConfirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>
          </div>
        )}

        <div className="divider">OR</div>

        <button onClick={handleGoogleLogin} className="google-login-btn" disabled={loading}>
          <span className="google-icon">G</span>
          {activeTab === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
        </button>

        <p className="login-info">
          {activeTab === 'login'
            ? 'Don\'t have an account? Click the Sign Up tab above.'
            : 'Already have an account? Click the Login tab above.'}
        </p>
      </div>
    </div>
  );
}

export default Login;
