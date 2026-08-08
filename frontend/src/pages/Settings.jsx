import { motion } from 'framer-motion';

const Settings = ({ user }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="page-content"
    >
      <div style={{ marginBottom: '2rem' }}>
        <h2>Settings</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage your account preferences and library configuration.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="card" style={{ height: 'fit-content' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Account Profile</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Username</label>
            <div style={{ fontWeight: 500 }}>{user?.username}</div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Role Level</label>
            <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Fines Due</label>
            <div style={{ fontWeight: 'bold', color: user?.fines > 0 ? 'var(--danger-color)' : 'var(--success-color)' }}>
              ${user?.fines || 0}
            </div>
          </div>
          <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Change Password</button>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Preferences</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Email Notifications</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Receive alerts for overdue books and new arrivals.</div>
            </div>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" defaultChecked style={{ width: '1.25rem', height: '1.25rem' }} />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontWeight: 500 }}>Dark Mode (Coming Soon)</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Switch between light and dark UI themes.</div>
            </div>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" disabled style={{ width: '1.25rem', height: '1.25rem' }} />
            </label>
          </div>
          
          <button className="btn btn-primary">Save Preferences</button>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
