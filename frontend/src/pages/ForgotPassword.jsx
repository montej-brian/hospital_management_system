import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    return (
        <div className="login-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h2>Reset Password</h2>
                    <p>Enter your email and we'll send you a reset link.</p>
                </div>

                <div className="auth-card">
                    <form>
                        <div className="form-group">
                            <label htmlFor="email">Email address</label>
                            <div className="input-wrapper">
                                <Mail className="input-icon" size={18} />
                                <input
                                    id="email" type="email"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <button type="button" className="btn-primary">
                            Send reset link
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <ArrowLeft size={16} /> Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
