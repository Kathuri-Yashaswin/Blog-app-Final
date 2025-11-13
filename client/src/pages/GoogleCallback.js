import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function GoogleCallback({ setUser }) {
  const navigate = useNavigate();

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const response = await axios.get('/auth/user', { withCredentials: true });
        if (response.data) {
          setUser(response.data);
          navigate('/dashboard');
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/login');
      }
    };

    authenticateUser();
  }, [setUser, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <p>Authenticating...</p>
    </div>
  );
}

export default GoogleCallback;
