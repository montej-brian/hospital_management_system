import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
    DollarSign, TrendingUp, AlertCircle, FileText, 
    Search, Filter, Plus, FileSpreadsheet, Download
} from 'lucide-react';
import '../../styles/billing.css';

// Mock Data
const MOCK_INVOICES = [
    { id: 'INV-2026-001', date: '2026-03-08', patient: 'Michael Scott', amount: 150.00, status: 'Paid' },
    { id: 'INV-2026-002', date: '2026-03-09', patient: 'Pam Beesly', amount: 350.50, status: 'Pending' },
    { id: 'INV-2026-003', date: '2026-03-01', patient: 'Dwight Schrute', amount: 890.00, status: 'Overdue' },
    { id: 'INV-2026-004', date: '2026-03-09', patient: 'Jim Halpert', amount: 45.00, status: 'Paid' },
    { id: 'INV-2026-005', date: '2026-03-05', patient: 'Stanley Hudson', amount: 1200.00, status: 'Partial' },
];

const BillingDashboard = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const filteredInvoices = MOCK_INVOICES.filter(inv => {
        const matchesSearch = inv.patient.toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        const lower = status.toLowerCase();
        return <span className={`status-badge ${lower}`}>{status}</span>;
    };

    return (
        <DashboardLayout breadcrumb="Billing & Payments">
            <div className="billing-container">
                <div className="page-header">
                    <h1>Financial Dashboard</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/admin/billing/insurance" className="btn btn-outline">
                            <FileSpreadsheet size={16} /> Insurance Claims
                        </Link>
                        <Link to="/admin/billing/new-invoice" className="btn btn-primary">
                            <Plus size={16} /> Generate Invoice
                        </Link>
                    </div>
                </div>

                {/* Financial Summary Charts / Cards */}
                <div className="financial-summary-grid">
                    <div className="financial-card accent">
                        <div className="financial-title">Total Revenue (This Month)</div>
                        <div className="financial-amount">$14,520</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}><TrendingUp size={14} style={{display:'inline', verticalAlign:'middle'}}/> +12.5% from last month</div>
                    </div>
                    <div className="financial-card">
                        <div className="financial-icon warning"><AlertCircle size={24} /></div>
                        <div className="financial-title">Pending Payments</div>
                        <div className="financial-amount" style={{color: 'var(--text)'}}>$3,450</div>
                    </div>
                    <div className="financial-card">
                        <div className="financial-icon danger"><AlertCircle size={24} /></div>
                        <div className="financial-title">Overdue Invoices</div>
                        <div className="financial-amount" style={{color: 'var(--danger)'}}>$890</div>
                    </div>
                    <div className="financial-card">
                        <div className="financial-icon success"><DollarSign size={24} /></div>
                        <div className="financial-title">Received Today</div>
                        <div className="financial-amount" style={{color: 'var(--success)'}}>$495</div>
                    </div>
                </div>

                {/* Invoices List */}
                <div className="billing-list">
                    <div className="billing-list-header">
                        <h3 style={{ margin: 0 }}>Recent Invoices & Payments</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="search-bar">
                                <Search size={18} color="var(--text-muted)" />
                                <input 
                                    className="search-input" 
                                    placeholder="Search invoice or patient..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="filter-dropdown">
                                <Filter size={18} color="var(--text-muted)" />
                                <select 
                                    className="filter-select"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Partial">Partial</option>
                                    <option value="Overdue">Overdue</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Invoice ID</th>
                                    <th>Date</th>
                                    <th>Patient</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.length > 0 ? (
                                    filteredInvoices.map((inv) => (
                                        <tr key={inv.id}>
                                            <td style={{ fontWeight: '600' }}>#{inv.id}</td>
                                            <td>{new Date(inv.date).toLocaleDateString()}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div className="avatar-placeholder sm">{inv.patient.charAt(0)}</div>
                                                    <span style={{ fontWeight: '500' }}>{inv.patient}</span>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: '600' }}>${inv.amount.toFixed(2)}</td>
                                            <td>{getStatusBadge(inv.status)}</td>
                                            <td className="text-right">
                                                <div className="action-buttons justify-end">
                                                    {(inv.status === 'Pending' || inv.status === 'Partial' || inv.status === 'Overdue') && (
                                                        <Link to={`/admin/billing/process/${inv.id}`} className="btn-icon" title="Process Payment" style={{ color: 'var(--success)' }}>
                                                            <DollarSign size={16} />
                                                        </Link>
                                                    )}
                                                    <Link to={`/admin/billing/invoice/${inv.id}`} className="btn-icon" title="View/Print Invoice">
                                                        <FileText size={16} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center" style={{ padding: '3rem' }}>
                                            <div style={{ color: 'var(--text-muted)' }}>No invoices match your search.</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BillingDashboard;
