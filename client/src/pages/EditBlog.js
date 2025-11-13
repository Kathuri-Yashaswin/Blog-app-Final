import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditBlog.css';

function EditBlog({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`/api/blogs/${id}`);
        const blog = response.data;

        if (blog.author._id !== user._id) {
          setError('You are not authorized to edit this blog');
          setLoading(false);
          return;
        }

        setTitle(blog.title);
        setContent(blog.content);
        setLoading(false);
      } catch (error) {
        setError('Blog not found');
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, user._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!title.trim() || !content.trim()) {
        setError('Title and content are required');
        setSubmitting(false);
        return;
      }

      await axios.put(`/api/blogs/${id}`, {
        title,
        content
      }, { withCredentials: true });

      navigate(`/blog/${id}`);
    } catch (error) {
      setError(error.response?.data?.error || 'Error updating blog');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  if (error && error.includes('not authorized')) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="edit-blog-container">
        <h1>Edit Blog</h1>
        
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="title">Blog Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your blog title"
              disabled={submitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content here..."
              disabled={submitting}
            />
          </div>

          <div className="button-group">
            <button 
              type="submit" 
              disabled={submitting}
              className="submit-btn"
            >
              {submitting ? 'Updating...' : 'Update Blog'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate(`/blog/${id}`)}
              className="cancel-btn"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBlog;
