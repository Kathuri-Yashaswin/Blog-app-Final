import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ForgotPassword.css';

function ForgotPassword() {
  const [stage, setStage] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/forgot-password', { email }, {
        withCredentials: true,
        timeout: 15000
      });

      if (response.data.requiresOTP) {
        setStage('otp');
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else {
        setError(err.response?.data?.error || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('/auth/reset-password', 
        { email, otp, newPassword, confirmPassword },
        { withCredentials: true, timeout: 15000 }
      );

      setStage('success');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else {
        setError(err.response?.data?.error || 'Password reset failed');
      }
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h1>Reset Password</h1>

        {stage === 'email' && (
          <div className="forgot-password-form">
            <p className="form-desc">Enter your email to receive an OTP</p>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSendOTP}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          </div>
        )}

        {stage === 'otp' && (
          <div className="forgot-password-form">
            <p className="form-desc">Enter OTP and new password</p>
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

              <div className="form-group password-group">
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="New password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading}
                >
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              <div className="form-group password-group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <button
              onClick={() => {
                setStage('email');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
              }}
              className="back-btn"
            >
              Back to Email
            </button>
          </div>
        )}

        {stage === 'success' && (
          <div className="success-message">
            <p>✓ Password reset successful!</p>
            <p>Redirecting to login...</p>
          </div>
        )}

        <p className="back-to-login">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
