import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('otp'); // 'otp' or 'password'
    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!email) {
            toast.error('Please initiate password reset from the login page.');
            navigate('/login');
        }
    }, [email, navigate]);

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setErrors({ otp: 'Please enter a valid 6-digit OTP' });
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            await axios.post('/api/auth/verify-otp', { email, otp });
            setStep('password');
            toast.success('OTP verified! Now enter your new password.');
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid or expired OTP';
            toast.error(msg);
            setErrors({ otp: msg });
        } finally {
            setLoading(false);
        }
    };

    const validatePasswords = () => {
        const e = {};
        if (!form.newPassword) {
            e.newPassword = 'Password is required';
        } else if (form.newPassword.length < 6) {
            e.newPassword = 'Password must be at least 6 characters';
        }

        if (form.newPassword !== form.confirmPassword) {
            e.confirmPassword = 'Passwords do not match';
        }
        return e;
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const errs = validatePasswords();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            await axios.post('/api/auth/reset-password', {
                email,
                otp,
                newPassword: form.newPassword
            });
            setSuccess(true);
            toast.success('Password reset successfully!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to reset password. OTP might have expired.';
            toast.error(msg);
            setErrors({ general: msg });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="login-page">
                <div className="login-left" style={{ margin: '0 auto' }}>
                    <div className="login-card" style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: 'var(--accent-green)' }}>
                            <CheckCircle size={64} />
                        </div>
                        <h2>Password Reset Successful</h2>
                        <p className="subtitle" style={{ marginBottom: '30px' }}>Your password has been successfully updated. You can now log in with your new password.</p>
                        <Link to="/login" className="btn btn-primary w-full" style={{ justifyContent: 'center', padding: '13px' }}>
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-page">
            <div className="login-left" style={{ margin: '0 auto' }}>
                <div className="login-brand" style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div className="logo-text">mobiOs</div>
                    <p>NIC Validating Application</p>
                </div>

                <div className="login-card">
                    <h2>{step === 'otp' ? 'Verify OTP' : 'Create New Password'}</h2>
                    <p className="subtitle">
                        {step === 'otp' 
                            ? `We've sent a 6-digit code to ${email}` 
                            : 'Set your new secure password below.'}
                    </p>

                    {errors.general && (
                        <div style={{
                            padding: '10px 14px', borderRadius: 'var(--radius-md)',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            color: 'var(--accent-red)', fontSize: '13px', marginBottom: '16px'
                        }}>
                            <AlertCircle size={16} />
                            {errors.general}
                        </div>
                    )}

                    {step === 'otp' ? (
                        <form onSubmit={handleVerifyOtp} noValidate>
                            <div className="form-group">
                                <label className="form-label">Enter 6-Digit OTP</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                        <KeyRound size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        className={`form-input${errors.otp ? ' error' : ''}`}
                                        style={{ paddingLeft: '38px', letterSpacing: '8px', fontSize: '20px', fontWeight: 'bold' }}
                                        placeholder="000000"
                                        maxLength={6}
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                    />
                                </div>
                                {errors.otp && <div className="form-error">⚠ {errors.otp}</div>}
                            </div>

                            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', padding: '13px', marginTop: '10px' }}>
                                {loading ? <><span className="spinner" /> Verifying...</> : <><ArrowRight size={18} /> Continue</>}
                            </button>
                            
                            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                <Link to="/login" className="link-btn" style={{ fontSize: '14px' }}>Back to Login</Link>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} noValidate>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                        <Lock size={16} />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={`form-input${errors.newPassword ? ' error' : ''}`}
                                        style={{ paddingLeft: '38px', paddingRight: '42px' }}
                                        placeholder="Enter new password"
                                        value={form.newPassword}
                                        onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                                    />
                                    <button type="button"
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                        onClick={() => setShowPassword(p => !p)}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.newPassword && <div className="form-error">⚠ {errors.newPassword}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                        <Lock size={16} />
                                    </span>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                                        style={{ paddingLeft: '38px', paddingRight: '42px' }}
                                        placeholder="Confirm new password"
                                        value={form.confirmPassword}
                                        onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                                    />
                                    <button type="button"
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                        onClick={() => setShowConfirmPassword(p => !p)}>
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <div className="form-error">⚠ {errors.confirmPassword}</div>}
                            </div>

                            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', padding: '13px', marginTop: '10px' }}>
                                {loading ? <><span className="spinner" /> Resetting...</> : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
