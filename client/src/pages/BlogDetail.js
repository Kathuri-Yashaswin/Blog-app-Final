import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './BlogDetail.css';

function BlogDetail({ user }) {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`/api/blogs/${id}`);
        setBlog(response.data);
      } catch (error) {
        setError('Blog not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <Link to="/">← Back to Home</Link>
      </div>
    );
  }

  const isAuthor = user && blog && user._id === blog.author._id;

  return (
    <div className="container">
      <Link to="/" className="back-link">← Back to Home</Link>
      
      <article className="blog-detail">
        <header className="blog-detail-header">
          <h1>{blog.title}</h1>
          <div className="blog-meta">
            <span className="author">By {blog.authorName}</span>
            <span className="date">
              {new Date(blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </header>

        <div className="blog-content">
          {blog.content.split('\n').map((paragraph, index) => (
            paragraph.trim() && <p key={index}>{paragraph}</p>
          ))}
        </div>

        {isAuthor && (
          <div className="blog-actions">
            <Link to={`/blog/${blog._id}/edit`} className="edit-btn">
              Edit Blog
            </Link>
            <Link to="/dashboard" className="dashboard-btn">
              Back to Dashboard
            </Link>
          </div>
        )}

        <footer className="blog-footer">
          <Link to={`/user/${blog.author._id}/blogs`} className="author-profile">
            View all posts by {blog.authorName}
          </Link>
        </footer>
      </article>
    </div>
  );
}

export default BlogDetail;
