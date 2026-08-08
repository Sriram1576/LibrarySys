import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Search, Plus, Trash2, ArrowRightLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const Books = ({ user }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', genre: 'General' });
  const [searchQuery, setSearchQuery] = useState('');

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchBooks = async (query = '') => {
    try {
      const response = await axios.get(`http://localhost:5000/api/books?search=${query}`, getHeaders());
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchBooks(searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;
    try {
      await axios.post('http://localhost:5000/api/books', newBook, getHeaders());
      setNewBook({ title: '', author: '', genre: 'General' });
      setShowAddForm(false);
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding book');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/books/${id}`, getHeaders());
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting book');
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axios.patch(`http://localhost:5000/api/books/${id}/${action}`, {}, getHeaders());
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.message || `Error ${action} book`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-content"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Library Catalog</h2>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#9ca3af' }} />
            <input 
              type="text" 
              placeholder="Search title, author, genre..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.5rem 1rem 0.5rem 2rem', borderRadius: '4px', border: '1px solid #e5e7eb', width: '250px' }}
            />
          </div>
          
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={16} /> Add New Book
            </button>
          )}
        </div>
      </div>

      {showAddForm && user?.role === 'admin' && (
        <div className="card">
          <form onSubmit={handleAddBook} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input 
              type="text" placeholder="Book Title" value={newBook.title}
              onChange={e => setNewBook({...newBook, title: e.target.value})}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }} required
            />
            <input 
              type="text" placeholder="Author" value={newBook.author}
              onChange={e => setNewBook({...newBook, author: e.target.value})}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }} required
            />
            <input 
              type="text" placeholder="Genre" value={newBook.genre}
              onChange={e => setNewBook({...newBook, genre: e.target.value})}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">Save Book</button>
            <button type="button" className="btn btn-outline" onClick={() => setShowAddForm(false)}>Cancel</button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Status</th>
              <th>Borrowed By</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading catalog...</td></tr>
            ) : books.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>No books found in the library.</td></tr>
            ) : (
              books.map(book => (
                <tr key={book._id}>
                  <td style={{ fontWeight: 500, color: 'var(--primary-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BookOpen size={16} /> {book.title}
                    </div>
                  </td>
                  <td>{book.author}</td>
                  <td>
                    <span className={`badge ${book.status === 'Available' ? 'badge-available' : 'badge-borrowed'}`}>
                      {book.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{book.borrowedBy?.username || '-'}</td>
                  <td style={{ color: 'var(--danger-color)' }}>{book.dueDate ? new Date(book.dueDate).toLocaleDateString() : '-'}</td>
                  <td style={{ display: 'flex', gap: '0.5rem' }}>
                    {book.status === 'Available' ? (
                      <button className="btn btn-outline" onClick={() => handleAction(book._id, 'borrow')}>
                        <ArrowRightLeft size={14} /> Borrow
                      </button>
                    ) : (
                      book.borrowedBy?._id === user?.id || user?.role === 'admin' ? (
                        <button className="btn btn-primary" onClick={() => handleAction(book._id, 'return')}>
                          <ArrowRightLeft size={14} /> Return
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Unavailable</span>
                      )
                    )}
                    
                    {user?.role === 'admin' && (
                      <button className="btn btn-danger" onClick={() => handleDelete(book._id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Books;
