import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './UserBlogs.css';

function UserBlogs() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [userResponse, blogsResponse] = await Promise.all([
          axios.get(`/api/users/${userId}`),
          axios.get(`/api/blogs/user/${userId}`)
        ]);
        
        setUser(userResponse.data);
        setBlogs(blogsResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  if (!user) {
    return (
      <div className="container">
        <div className="error">User not found</div>
        <Link to="/">← Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/" className="back-link">← Back to Home</Link>

      <div className="user-profile">
        <div className="profile-header">
          {user.profileImage && (
            <img src={user.profileImage} alt={user.name} className="profile-image" />
          )}
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="user-blogs-section">
        <h2>Posts by {user.name} ({blogs.length})</h2>
        
        {blogs.length === 0 ? (
          <p className="no-blogs-message">This user hasn't written any blogs yet.</p>
        ) : (
          <div className="blogs-grid">
            {blogs.map((blog) => (
              <div key={blog._id} className="blog-card">
                <Link to={`/blog/${blog._id}`} className="blog-title-link">
                  <h2 className="blog-title">{blog.title}</h2>
                </Link>
                <p className="blog-date">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </p>
                <p className="blog-excerpt">
                  {blog.content.substring(0, 150)}...
                </p>
                <Link to={`/blog/${blog._id}`} className="read-more">
                  Read More →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserBlogs;
