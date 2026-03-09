import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
    ArrowLeft, CreditCard, Banknote, Smartphone, CheckCircle, 
    Bell
} from 'lucide-react';

const PaymentProcessor = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // e.g. INV-2026-002
    
    // Mock Invoice Data based on ID
    const [invoiceData] = useState({
        id: id || 'N/A',
        patient: 'Pam Beesly',
        total: 350.50,
        paid: 0,
        due: 350.50,
        status: 'Pending'
    });

    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [amount, setAmount] = useState(invoiceData.due);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handlePayment = (e) => {
        e.preventDefault();
        setProcessing(true);
        // Simulate network API call
        setTimeout(() => {
            setProcessing(false);
            setSuccess(true);
        }, 1500);
    };

    const handleSendReminder = () => {
        alert('Payment reminder successfully sent to patient via SMS/Email!');
    };

    if (success) {
        return (
            <DashboardLayout breadcrumb="Payment Success">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle size={40} />
                    </div>
                    <h2>Payment Successful!</h2>
                    <p style={{ color: 'var(--text-muted)' }}>${parseFloat(amount).toFixed(2)} has been recorded for Invoice #{invoiceData.id}.</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <Link to={`/admin/billing/invoice/${invoiceData.id}`} className="btn btn-outline">View Receipt</Link>
                        <Link to="/admin/billing" className="btn btn-primary">Back to Dashboard</Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout breadcrumb="Process Payment">
            <div className="billing-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/admin/billing" className="btn-icon"><ArrowLeft size={18} /></Link>
                        <h1>Collect Payment</h1>
                    </div>
                    <button className="btn btn-outline" onClick={handleSendReminder}>
                        <Bell size={16} /> Send Reminder
                    </button>
                </div>

                <div className="auth-card" style={{ padding: '2rem' }}>
                    {/* Invoice Summary */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Patient</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{invoiceData.patient}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Invoice ID</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>#{invoiceData.id}</div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total Amount</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>${invoiceData.total.toFixed(2)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--success)', marginBottom: '0.25rem' }}>Paid So Far</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}>${invoiceData.paid.toFixed(2)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--danger)', marginBottom: '0.25rem' }}>Amount Due</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--danger)' }}>${invoiceData.due.toFixed(2)}</div>
                        </div>
                    </div>

                    <form onSubmit={handlePayment}>
                        <h3 style={{ marginBottom: '1rem' }}>Payment Details</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Payment Method</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                    {[
                                        { id: 'Credit Card', icon: CreditCard },
                                        { id: 'Cash', icon: Banknote },
                                        { id: 'Mobile Money', icon: Smartphone }
                                    ].map(method => (
                                        <button 
                                            key={method.id}
                                            type="button"
                                            onClick={() => setPaymentMethod(method.id)}
                                            style={{
                                                background: paymentMethod === method.id ? 'var(--bg)' : 'transparent',
                                                border: paymentMethod === method.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                                                borderRadius: '8px', padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column',
                                                alignItems: 'center', gap: '0.25rem', cursor: 'pointer', transition: 'all 0.2s',
                                                color: paymentMethod === method.id ? 'var(--accent)' : 'var(--text-muted)'
                                            }}
                                        >
                                            <method.icon size={20} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>{method.id}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Amount to Pay ($)</label>
                                <input 
                                    type="number" 
                                    className="search-input" 
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    max={invoiceData.due}
                                    style={{ width: '100%', fontSize: '1.25rem', padding: '1rem' }}
                                    required
                                />
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Leave as ${invoiceData.due.toFixed(2)} to pay in full, or type a lesser amount for partial payment.
                                </div>
                            </div>
                        </div>

                        {paymentMethod === 'Credit Card' && (
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>Card Details (Simulated)</label>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <input className="search-input" placeholder="Card Number (0000 0000 0000 0000)" style={{ flex: '1 1 100%' }} />
                                    <input className="search-input" placeholder="MM/YY" style={{ flex: 1 }} />
                                    <input className="search-input" placeholder="CVC" style={{ flex: 1 }} />
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
                            disabled={processing || !amount || parseFloat(amount) <= 0}
                        >
                            {processing ? 'Processing...' : `Process Payment of $${parseFloat(amount || 0).toFixed(2)}`}
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PaymentProcessor;
