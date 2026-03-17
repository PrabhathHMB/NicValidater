import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Users, UserPlus, Shield, Mail, Calendar, RefreshCw, X, CheckCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const { user: currentUser } = useAuth();
    const currentUserId = currentUser?.id || Number(localStorage.getItem('userId'));

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/auth/users');
            setUsers(res.data || []);
        } catch (e) {
            toast.error('Failed to fetch users. Access denied?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post('/api/auth/create-admin', formData);
            toast.success('Admin created successfully');
            setShowModal(false);
            setFormData({ username: '', email: '', password: '' });
            fetchUsers();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to create admin');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = async (id, username) => {
        if (id === currentUserId) {
            toast.error('You cannot delete your own account');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
            return;
        }

        try {
            await axios.delete(`/api/auth/users/${id}`);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to delete user');
        }
    };

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1>User Management</h1>
                    <p>Manage system users and create new administrator accounts</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <UserPlus size={18} /> Create Admin
                </button>
            </div>

            <div className="card">
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '12px', color: 'var(--text-secondary)' }}>
                        <span className="spinner" /> Loading users...
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
                        <div style={{ fontWeight: 600, marginBottom: '6px' }}>No users found</div>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined Date</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div className="user-avatar" style={{ width: 32, height: 32, fontSize: '13px' }}>
                                                    {u.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 500 }}>{u.username}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                                <Mail size={14} /> {u.email}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.role === 'ADMIN' ? 'badge-purple' : 'badge-blue'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                {u.role === 'ADMIN' && <Shield size={12} />} {u.role}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                                <Calendar size={14} /> {new Date(u.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                                                <CheckCircle size={14} /> Active
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {u.id !== currentUserId && (
                                                <button 
                                                    onClick={() => handleDeleteUser(u.id, u.username)}
                                                    className="btn-icon" 
                                                    title="Delete User"
                                                    style={{ color: 'var(--accent-red)', background: 'rgba(239,68,68,0.1)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create System Admin</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateAdmin} style={{ padding: '24px' }}>
                            <div className="form-group">
                                <label>Username</label>
                                <div className="input-with-icon">
                                    <input 
                                        type="text" 
                                        required 
                                        value={formData.username}
                                        onChange={e => setFormData({...formData, username: e.target.value})}
                                        placeholder="Enter username"
                                    />
                                    <Users size={18} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <div className="input-with-icon">
                                    <input 
                                        type="email" 
                                        required 
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        placeholder="admin@mobios.lk"
                                    />
                                    <Mail size={18} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div className="input-with-icon">
                                    <input 
                                        type="password" 
                                        required 
                                        value={formData.password}
                                        onChange={e => setFormData({...formData, password: e.target.value})}
                                        placeholder="Min 6 characters"
                                    />
                                    <Shield size={18} />
                                </div>
                            </div>
                            <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '44px' }} disabled={submitting}>
                                    {submitting ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span className="spinner" style={{ width: 16, height: 16 }} /> Creating...
                                        </span>
                                    ) : (
                                        'Create Admin Account'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
