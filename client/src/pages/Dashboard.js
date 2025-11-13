import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteSuccess, setDeleteSuccess] = useState('');

  useEffect(() => {
    const fetchUserBlogs = async () => {
      try {
        const response = await axios.get(`/api/blogs/user/${user._id}`);
        setBlogs(response.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserBlogs();
  }, [user]);

  const deleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(`/api/blogs/${blogId}`, { withCredentials: true });
        setBlogs(blogs.filter(blog => blog._id !== blogId));
        setDeleteSuccess('Blog deleted successfully!');
        setTimeout(() => setDeleteSuccess(''), 3000);
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name}!</p>
      </div>

      {deleteSuccess && <div className="success">{deleteSuccess}</div>}

      <Link to="/create" className="create-blog-btn">
        + Write New Blog
      </Link>

      {blogs.length === 0 ? (
        <div className="no-blogs-dashboard">
          <p>You haven't written any blogs yet.</p>
          <Link to="/create" className="create-link">Start writing your first blog →</Link>
        </div>
      ) : (
        <div className="dashboard-content">
          <h2>Your Blogs ({blogs.length})</h2>
          <div className="blogs-list">
            {blogs.map((blog) => (
              <div key={blog._id} className="blog-row">
                <div className="blog-info">
                  <h3>{blog.title}</h3>
                  <p className="blog-date">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="blog-actions">
                  <Link to={`/blog/${blog._id}`} className="btn-view">
                    View
                  </Link>
                  <Link to={`/blog/${blog._id}/edit`} className="btn-edit">
                    Edit
                  </Link>
                  <button 
                    onClick={() => deleteBlog(blog._id)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
