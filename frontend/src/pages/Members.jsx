import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Members = ({ user }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchMembers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMembers(response.data);
      } catch (error) {
        console.error('Error fetching members', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-secondary)' }}>
        <AlertCircle size={48} style={{ marginBottom: '1rem', color: 'var(--danger-color)' }} />
        <h2>Access Denied</h2>
        <p>You must be an administrator to view the member directory.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-content"
    >
      <div style={{ marginBottom: '2rem' }}>
        <h2>Library Members</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage all registered students and administrators.</p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Role</th>
              <th>Outstanding Fines</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading members...</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center' }}>No members found.</td></tr>
            ) : (
              members.map(member => (
                <tr key={member.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>#{member.id}</td>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} color="var(--primary-color)" /> {member.username}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${member.role === 'admin' ? 'badge-available' : 'badge-borrowed'}`} style={{ backgroundColor: member.role === 'admin' ? '#dbeafe' : '#f3f4f6', color: member.role === 'admin' ? '#1e40af' : '#4b5563' }}>
                      {member.role}
                    </span>
                  </td>
                  <td style={{ color: member.fines > 0 ? 'var(--danger-color)' : 'var(--success-color)', fontWeight: 500 }}>
                    ${member.fines}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(member.createdAt).toLocaleDateString()}
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

export default Members;
