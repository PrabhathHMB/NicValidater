import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Lock, User, X } from 'lucide-react';

export default function LoginPage() {
    const [form, setForm] = useState({ username: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const e = {};
        if (!form.username.trim()) e.username = 'Username is required';
        else if (form.username.length < 3) e.username = 'Username must be at least 3 characters';
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/login', form);
            localStorage.setItem('userId', res.data.id);
            login(res.data);
            toast.success(`Welcome back, ${res.data.username}!`);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
            toast.error(msg);
            setErrors({ general: msg });
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
            toast.error('Please enter a valid email address');
            return;
        }
        setForgotLoading(true);
        try {
            await axios.post('/api/auth/forgot-password', { email: forgotEmail });
            toast.success('OTP sent! Check your email.');
            setShowForgot(false);
            navigate('/reset-password', { state: { email: forgotEmail } });
            setForgotEmail('');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send reset link';
            toast.error(msg);
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-brand">
                    <div className="logo-text">mobiOs</div>
                    <p>NIC Validating Application</p>
                </div>

                <div className="login-card">
                    <h2>Welcome Back</h2>
                    <p className="subtitle">Sign in to access the NIC validation system</p>

                    {errors.general && (
                        <div style={{
                            padding: '10px 14px', borderRadius: 'var(--radius-md)',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            color: 'var(--accent-red)', fontSize: '13px', marginBottom: '16px'
                        }}>
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <User size={16} />
                                </span>
                                <input
                                    type="text"
                                    className={`form-input${errors.username ? ' error' : ''}`}
                                    style={{ paddingLeft: '38px' }}
                                    placeholder="Enter your username"
                                    value={form.username}
                                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                    autoComplete="username"
                                />
                            </div>
                            {errors.username && <div className="form-error">⚠ {errors.username}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Lock size={16} />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className={`form-input${errors.password ? ' error' : ''}`}
                                    style={{ paddingLeft: '38px', paddingRight: '42px' }}
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    autoComplete="current-password"
                                />
                                <button type="button"
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                    onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <div className="form-error">⚠ {errors.password}</div>}
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '20px', marginTop: '-8px' }}>
                            <button type="button" className="link-btn" onClick={() => setShowForgot(true)}>
                                Forgot password?
                            </button>
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', padding: '13px' }}>
                            {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                Don't have an account? <Link to="/register" className="link-btn">Sign Up</Link>
                            </p>
                        </div>
                    </form>
                </div>

                <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    © 2024 MobiOs Private Ltd · All rights reserved
                </p>
            </div>

            {/* Forgot Password Modal */}
            {showForgot && (
                <div className="modal-overlay" onClick={() => setShowForgot(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <h3>Reset Password</h3>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowForgot(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <p>Enter your registered email address and we'll send you an OTP code to reset your password.</p>
                        <form onSubmit={handleForgot}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="your@email.com"
                                    value={forgotEmail}
                                    onChange={e => setForgotEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForgot(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={forgotLoading} style={{ flex: 1, justifyContent: 'center' }}>
                                    {forgotLoading ? <><span className="spinner" /> Sending...</> : 'Send OTP'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
