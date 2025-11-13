import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateBlog.css';

function CreateBlog({ user }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!title.trim() || !content.trim()) {
        setError('Title and content are required');
        setLoading(false);
        return;
      }

      const response = await axios.post('/api/blogs', {
        title,
        content
      }, { withCredentials: true });

      navigate(`/blog/${response.data._id}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Error creating blog');
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="create-blog-container">
        <h1>Write a New Blog</h1>
        
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label htmlFor="title">Blog Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your blog title"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content here..."
              disabled={loading}
            />
          </div>

          <div className="button-group">
            <button 
              type="submit" 
              disabled={loading}
              className="submit-btn"
            >
              {loading ? 'Publishing...' : 'Publish Blog'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')}
              className="cancel-btn"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBlog;
