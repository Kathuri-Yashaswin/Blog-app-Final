import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function GoogleCallback({ setUser }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');

        if (token && userParam) {
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const user = JSON.parse(decodeURIComponent(userParam));
          setUser(user);
          navigate('/dashboard');
        } else {
          const response = await axios.get('/auth/user', { withCredentials: true });
          if (response.data) {
            setUser(response.data);
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Auth error:', error);
        navigate('/login');
      }
    };

    authenticateUser();
  }, [searchParams, setUser, navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <p>Authenticating...</p>
    </div>
  );
}

export default GoogleCallback;
