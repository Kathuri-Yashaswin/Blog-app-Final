import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

function Home({ user }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await axios.get('/api/blogs');
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><p>Loading blogs...</p></div>;
  }

  if (!user) {
    return (
      <div className="container">
        <div className="home-header">
          <h1>Welcome to Blog App</h1>
          <p>Discover amazing stories and insights from our community</p>
        </div>
        <div className="no-blogs">
          <p>Please <Link to="/login">Login</Link> to view blogs and share your stories!</p>
        </div>
      </div>
    );
  }

  const getFilteredBlogs = () => {
    if (!searchQuery.trim()) {
      return blogs;
    }
    
    const query = searchQuery.toLowerCase();
    
    const prefixMatches = blogs.filter(blog => {
      const titleStartsWith = blog.title.toLowerCase().startsWith(query);
      const authorStartsWith = blog.authorName.toLowerCase().startsWith(query);
      return titleStartsWith || authorStartsWith;
    });
    
    const substringMatches = blogs.filter(blog => {
      const titleIncludes = blog.title.toLowerCase().includes(query);
      const authorIncludes = blog.authorName.toLowerCase().includes(query);
      return (titleIncludes || authorIncludes) && 
             !blog.title.toLowerCase().startsWith(query) &&
             !blog.authorName.toLowerCase().startsWith(query);
    });
    
    return [...prefixMatches, ...substringMatches];
  };

  const filteredBlogs = getFilteredBlogs();

  return (
    <div className="container">
      <div className="home-header">
        <h1>Welcome to Blog App</h1>
        <p>Discover amazing stories and insights from our community</p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search blogs by title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {searchQuery.trim() && filteredBlogs.length === 0 ? (
        <div className="no-blogs">
          <p>No blogs with this title or author name.</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="no-blogs">
          <p>No blogs yet. <Link to="/create">Be the first to write!</Link></p>
        </div>
      ) : (
        <div className="blogs-grid">
          {filteredBlogs.map((blog) => (
            <div key={blog._id} className="blog-card">
              <Link to={`/blog/${blog._id}`} className="blog-title-link">
                <h2 className="blog-title">{blog.title}</h2>
              </Link>
              <p className="blog-author">By {blog.authorName}</p>
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
  );
}

export default Home;
