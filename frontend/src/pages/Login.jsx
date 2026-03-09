import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Mail, Lock, LogIn } from 'lucide-react';

const validate = (values) => {
    const errors = {};
    if (!values.username.trim()) errors.username = 'Username is required';
    if (!values.password) errors.password = 'Password is required';
    return errors;
};

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({ username: '', password: '', rememberMe: false });
    const [touched, setTouched] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValues = { ...values, [name]: type === 'checkbox' ? checked : value };
        setValues(newValues);
        if (touched[name]) setFieldErrors(validate(newValues));
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({ ...touched, [name]: true });
        setFieldErrors(validate(values));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(values);
        setFieldErrors(errs);
        setTouched({ username: true, password: true });
        if (Object.keys(errs).length > 0) return;

        setError('');
        setLoading(true);
        const result = await login({ username: values.username, password: values.password });
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h2>Sign in to your account</h2>
                    <p>Or{' '}
                        <Link to="/register" className="auth-link">create a new patient account</Link>
                    </p>
                </div>

                <div className="auth-card">
                    {error && (
                        <div className="error-banner">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={values.username}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="Enter username"
                                />
                            </div>
                            {touched.username && fieldErrors.username && (
                                <div className="field-error">{fieldErrors.username}</div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={18} />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={values.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    placeholder="••••••••"
                                />
                            </div>
                            {touched.password && fieldErrors.password && (
                                <div className="field-error">{fieldErrors.password}</div>
                            )}
                        </div>

                        <div className="form-row">
                            <div className="checkbox-group">
                                <input
                                    id="rememberMe"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={values.rememberMe}
                                    onChange={handleChange}
                                />
                                <label htmlFor="rememberMe">Remember me</label>
                            </div>
                            <Link to="/forgot-password" className="auth-link">Forgot your password?</Link>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <Loader2 className="spinner" size={20} /> : (
                                <><LogIn size={18} /> Sign in</>
                            )}
                        </button>
                    </form>

                    <div className="divider">
                        <span>Or continue with</span>
                    </div>

                    <div className="social-buttons">
                        <button className="btn-social">Google</button>
                        <button className="btn-social">GitHub</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
