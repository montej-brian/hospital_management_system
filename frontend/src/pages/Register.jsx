import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const validate = (values) => {
    const errors = {};
    if (!values.username || values.username.length < 3) errors.username = 'Min 3 characters';
    if (!values.email || !/\S+@\S+\.\S+/.test(values.email)) errors.email = 'Invalid email';
    if (!values.fullName) errors.fullName = 'Required';
    if (!values.phone) errors.phone = 'Required';
    if (!values.password || values.password.length < 6) errors.password = 'Min 6 characters';
    if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords must match';
    return errors;
};

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [values, setValues] = useState({
        username: '', email: '', password: '', confirmPassword: '', fullName: '', phone: ''
    });
    const [touched, setTouched] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValues = { ...values, [name]: value };
        setValues(newValues);
        if (touched[name]) setFieldErrors(validate(newValues));
    };

    const handleBlur = (e) => {
        setTouched({ ...touched, [e.target.name]: true });
        setFieldErrors(validate(values));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate(values);
        setFieldErrors(errs);
        setTouched(Object.fromEntries(Object.keys(values).map(k => [k, true])));
        if (Object.keys(errs).length > 0) return;

        setError('');
        setLoading(true);
        const result = await register({
            username: values.username, email: values.email,
            password: values.password, fullName: values.fullName, phone: values.phone
        });
        if (result.success) {
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    const renderField = (name, label, type = 'text', placeholder = '') => (
        <div className="form-group">
            <label htmlFor={name}>{label}</label>
            <input
                id={name} name={name} type={type}
                value={values[name]} onChange={handleChange} onBlur={handleBlur}
                placeholder={placeholder}
            />
            {touched[name] && fieldErrors[name] && (
                <div className="field-error">{fieldErrors[name]}</div>
            )}
        </div>
    );

    return (
        <div className="login-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h2>Create Patient Account</h2>
                    <p>Or{' '}
                        <Link to="/login" className="auth-link">sign in to your existing account</Link>
                    </p>
                </div>

                <div className="auth-card">
                    {error && (
                        <div className="error-banner"><p>{error}</p></div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row-grid">
                            {renderField('username', 'Username', 'text', 'john_doe')}
                            {renderField('fullName', 'Full Name', 'text', 'John Doe')}
                        </div>
                        {renderField('email', 'Email Address', 'email', 'you@example.com')}
                        {renderField('phone', 'Phone Number', 'text', '+254...')}
                        <div className="form-row-grid">
                            {renderField('password', 'Password', 'password', '••••••••')}
                            {renderField('confirmPassword', 'Confirm Password', 'password', '••••••••')}
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <Loader2 className="spinner" size={20} /> : 'Register'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
