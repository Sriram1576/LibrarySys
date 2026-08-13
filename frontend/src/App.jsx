import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Library, Users, Settings as SettingsIcon, Bell, Search, LogOut } from 'lucide-react';
import Books from './pages/Books';
import Login from './pages/Login';
import Members from './pages/Members';
import Settings from './pages/Settings';
import axios from 'axios';

const Dashboard = ({ user }) => {
  const [totalBooks, setTotalBooks] = useState('--');

  useEffect(() => {
    axios.get('https://gutendex.com/books/')
      .then(res => setTotalBooks(res.data.count.toLocaleString()))
      .catch(() => setTotalBooks('Error'));
  }, []);

  return (
    <div className="page-content">
      <h2 style={{ marginBottom: '2rem' }}>Welcome back, {user?.username}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Books</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{totalBooks}</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Books Borrowed</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>--</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active Fines</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--danger-color)' }}>
            ${user?.fines || 0}
          </p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Role</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', textTransform: 'capitalize' }}>
            {user?.role || 'Guest'}
          </p>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ setAuthUser }) => {
  const location = useLocation();
  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Book Catalog', path: '/books', icon: Library },
    { name: 'Members', path: '/members', icon: Users },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthUser(null);
  };

  return (
    <aside className="sidebar" style={{ justifyContent: 'space-between' }}>
      <div>
        <div className="sidebar-header">
          <Library size={24} color="#3b82f6" />
          LibrarySys
        </div>
        <ul className="nav-links">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.name}>
                <Link 
                  to={link.path} 
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  <Icon size={20} />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <div style={{ padding: '1rem' }}>
        <button onClick={handleLogout} className="nav-link" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <LogOut size={20} color="#ef4444" />
          <span style={{ color: '#ef4444' }}>Logout</span>
        </button>
      </div>
    </aside>
  );
};

const Topbar = ({ user }) => (
  <header className="topbar">
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', width: '300px', background: '#f3f4f6', padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
      <Search size={18} />
      <input type="text" placeholder="Search everywhere..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%' }} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
      <Bell size={20} color="var(--text-secondary)" />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.username}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user?.role}</div>
        </div>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          {user?.username?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </div>
  </header>
);

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setAuthUser(JSON.parse(savedUser));
      
      // Optionally verify token with backend
      axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setAuthUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      }).catch(() => {
        // Token invalid or backend down
        console.error("Session verification failed. Assuming backend is unavailable or token expired.");
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

  if (!authUser) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<Login setAuthUser={setAuthUser} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar setAuthUser={setAuthUser} />
        <main className="main-content">
          <Topbar user={authUser} />
          <Routes>
            <Route path="/" element={<Dashboard user={authUser} />} />
            <Route path="/books" element={<Books user={authUser} />} />
            <Route path="/members" element={<Members user={authUser} />} />
            <Route path="/settings" element={<Settings user={authUser} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
