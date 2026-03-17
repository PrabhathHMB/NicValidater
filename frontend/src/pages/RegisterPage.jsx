import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Lock, User, Mail, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const validate = () => {
        const e = {};
        if (!form.username.trim()) e.username = 'Username is required';
        else if (form.username.length < 3) e.username = 'Username must be at least 3 characters';
        
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
        
        if (!form.password) e.password = 'Password is required';
        else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
        
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        setLoading(true);
        try {
            await axios.post('/api/auth/register', {
                username: form.username,
                email: form.email,
                password: form.password
            });
            toast.success('Registration successful! Please sign in.');
            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(msg);
            setErrors({ general: msg });
        } finally {
            setLoading(false);
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
                    <h2>Create Account</h2>
                    <p className="subtitle">Join the NIC validation system today</p>

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
                                    placeholder="Choose a username"
                                    value={form.username}
                                    onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                                />
                            </div>
                            {errors.username && <div className="form-error">⚠ {errors.username}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Mail size={16} />
                                </span>
                                <input
                                    type="email"
                                    className={`form-input${errors.email ? ' error' : ''}`}
                                    style={{ paddingLeft: '38px' }}
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                />
                            </div>
                            {errors.email && <div className="form-error">⚠ {errors.email}</div>}
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
                                    placeholder="Create a password"
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                />
                                <button type="button"
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                    onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <div className="form-error">⚠ {errors.password}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <ShieldCheck size={16} />
                                </span>
                                <input
                                    type="password"
                                    className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                                    style={{ paddingLeft: '38px' }}
                                    placeholder="Confirm your password"
                                    value={form.confirmPassword}
                                    onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                />
                            </div>
                            {errors.confirmPassword && <div className="form-error">⚠ {errors.confirmPassword}</div>}
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', padding: '13px', marginTop: '10px' }}>
                            {loading ? <><span className="spinner" /> Creating account...</> : 'Sign Up'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                Already have an account? <Link to="/login" className="link-btn">Sign In</Link>
                            </p>
                        </div>
                    </form>
                </div>

                <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    © 2024 MobiOs Private Ltd · All rights reserved
                </p>
            </div>
        </div>
    );
}
