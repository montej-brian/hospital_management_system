import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { ArrowLeft, Upload, FileText, Send, CheckCircle, Shield } from 'lucide-react';

const MOCK_CLAIMS = [
    { id: 'CLM-001', date: '2026-03-05', patient: 'Jim Halpert', provider: 'BlueCross BlueShield', amount: 450.00, status: 'Approved' },
    { id: 'CLM-002', date: '2026-03-08', patient: 'Pam Beesly', provider: 'Aetna', amount: 1200.00, status: 'Pending Approval' },
    { id: 'CLM-003', date: '2026-03-02', patient: 'Dwight Schrute', provider: 'UnitedHealthcare', amount: 300.00, status: 'Denied' }
];

const InsuranceClaims = () => {
    const [view, setView] = useState('list'); // 'list' or 'new'
    
    // Form States
    const [patientName, setPatientName] = useState('');
    const [provider, setProvider] = useState('');
    const [policyNumber, setPolicyNumber] = useState('');
    const [invoiceRef, setInvoiceRef] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Insurance Claim Submitted Successfully!');
        setView('list');
    };

    const getStatusColor = (status) => {
        if (status === 'Approved') return 'var(--success)';
        if (status === 'Denied') return 'var(--danger)';
        return 'var(--warning)';
    };

    return (
        <DashboardLayout breadcrumb={view === 'list' ? 'Insurance Claims' : 'New Claim'}>
            <div className="billing-container">
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/admin/billing" className="btn-icon"><ArrowLeft size={18} /></Link>
                        <h1>{view === 'list' ? 'Insurance Claims Hub' : 'File a New Claim'}</h1>
                    </div>
                    {view === 'list' && (
                        <button className="btn btn-primary" onClick={() => setView('new')}>
                            <FileText size={16} /> File New Claim
                        </button>
                    )}
                </div>

                {view === 'list' ? (
                    <div className="billing-list">
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Claim ID</th>
                                        <th>Submission Date</th>
                                        <th>Patient</th>
                                        <th>Insurance Provider</th>
                                        <th>Claim Amount</th>
                                        <th>Status</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_CLAIMS.map((claim) => (
                                        <tr key={claim.id}>
                                            <td style={{ fontWeight: '600' }}>#{claim.id}</td>
                                            <td>{new Date(claim.date).toLocaleDateString()}</td>
                                            <td>{claim.patient}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Shield size={14} color="var(--primary)" /> {claim.provider}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: '600' }}>${claim.amount.toFixed(2)}</td>
                                            <td style={{ color: getStatusColor(claim.status), fontWeight: '600' }}>{claim.status}</td>
                                            <td className="text-right">
                                                <button className="btn-icon" title="View details"><FileText size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="auth-card" style={{ padding: '2rem', maxWidth: '800px' }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Patient Name</label>
                                    <input className="search-input" style={{ width: '100%' }} value={patientName} onChange={e => setPatientName(e.target.value)} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Related Invoice #</label>
                                    <input className="search-input" style={{ width: '100%' }} value={invoiceRef} onChange={e => setInvoiceRef(e.target.value)} required />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Insurance Provider</label>
                                    <select className="search-input" style={{ width: '100%' }} value={provider} onChange={e => setProvider(e.target.value)} required>
                                        <option value="">-- Select Provider --</option>
                                        <option value="BlueCross BlueShield">BlueCross BlueShield</option>
                                        <option value="Aetna">Aetna</option>
                                        <option value="UnitedHealthcare">UnitedHealthcare</option>
                                        <option value="Cigna">Cigna</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Policy Group Number</label>
                                    <input className="search-input" style={{ width: '100%' }} value={policyNumber} onChange={e => setPolicyNumber(e.target.value)} required />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Claim Amount ($)</label>
                                    <input type="number" className="search-input" style={{ width: '100%' }} value={amount} onChange={e => setAmount(e.target.value)} required />
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', border: '1px dashed var(--border)', padding: '2rem', textAlign: 'center', borderRadius: '8px', marginBottom: '2rem' }}>
                                <Upload size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                                <h4>Upload Supporting Documents</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Include medical records, referrals, and itemized bills.</p>
                                <button type="button" className="btn btn-outline" onClick={() => alert('File picker opened')}>Select Files</button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setView('list')}>Cancel</button>
                                <button type="submit" className="btn btn-primary"><Send size={16} /> Submit Claim to Payer</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default InsuranceClaims;
