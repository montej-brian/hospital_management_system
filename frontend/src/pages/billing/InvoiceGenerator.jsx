import React, { useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
    ArrowLeft, Plus, Trash2, Save, Printer, FileText, Upload
} from 'lucide-react';
import '../../styles/billing.css';

const DEFAULT_ITEMS = [
    { id: 1, desc: 'General Consultation', cost: 50 },
    { id: 2, desc: 'Specialist Consultation', cost: 120 },
    { id: 3, desc: 'Blood Test (CBC)', cost: 35 },
    { id: 4, desc: 'X-Ray', cost: 80 },
    { id: 5, desc: 'Pharmacy Items', cost: 0 }
];

const InvoiceGenerator = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // ID can be present if viewing/editing
    
    // States
    const [patientName, setPatientName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [issueDate] = useState(new Date().toLocaleDateString());
    
    const [items, setItems] = useState([
        { id: Date.now(), desc: 'General Consultation', qty: 1, price: 50 }
    ]);
    
    const [taxRate, setTaxRate] = useState(10); // 10%
    const [discount, setDiscount] = useState(0); // flat amount
    
    // Handlers
    const addItem = () => {
        setItems([...items, { id: Date.now(), desc: '', qty: 1, price: 0 }]);
    };
    
    const updateItem = (id, field, value) => {
        setItems(items.map(item => item.id === id ? { ...item, [field]: field === 'desc' ? value : parseFloat(value) || 0 } : item));
    };
    
    const removeItem = (id) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };
    
    // Calculations
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = Math.max(0, subtotal + taxAmount - discount);

    const handleSave = () => {
        alert('Invoice Draft Saved!');
        navigate('/admin/billing');
    };

    return (
        <DashboardLayout breadcrumb={id ? `Invoice #${id}` : "Create Invoice"}>
            <div className="billing-container">
                <div className="page-header no-print">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/admin/billing" className="btn-icon">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1>{id ? `Invoice #${id}` : "Generate Invoice"}</h1>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-outline" onClick={() => window.print()}>
                            <Printer size={16} /> Print Receipt
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            <Save size={16} /> Save Invoice
                        </button>
                    </div>
                </div>

                <div className="printable-invoice">
                    <div className="invoice-builder">
                        
                        {/* LEFT: Bill Items Management */}
                        <div className="invoice-section">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FileText size={18} color="var(--accent)" /> Bill Items
                                </h3>
                                <button className="btn btn-outline no-print" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={addItem}>
                                    <Plus size={14} /> Add Row
                                </button>
                            </div>

                            {/* Header Row */}
                            <div className="invoice-item-row no-print" style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <div>Description</div>
                                <div>Qty</div>
                                <div>Unit Price ($)</div>
                                <div>Total ($)</div>
                                <div></div>
                            </div>

                            {/* Items List */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {items.map((item, index) => (
                                    <div key={item.id} className="invoice-item-row">
                                        <input 
                                            className="search-input" 
                                            placeholder="Item Description..." 
                                            value={item.desc}
                                            onChange={(e) => updateItem(item.id, 'desc', e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                        <input 
                                            type="number" 
                                            className="search-input text-center" 
                                            min="1"
                                            value={item.qty}
                                            onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                        <input 
                                            type="number" 
                                            className="search-input text-right" 
                                            min="0"
                                            value={item.price}
                                            onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                        <div style={{ fontWeight: '600', textAlign: 'right' }}>
                                            ${(item.qty * item.price).toFixed(2)}
                                        </div>
                                        <button className="btn-icon no-print" onClick={() => removeItem(item.id)} style={{ color: 'var(--danger)' }} disabled={items.length === 1}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Dynamic Totals */}
                            <div className="invoice-totals">
                                <div className="totals-row">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="totals-row no-print" style={{ alignItems: 'center' }}>
                                    <span>Tax Rate (%)</span>
                                    <input 
                                        type="number" 
                                        className="search-input text-right" 
                                        style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                                        value={taxRate}
                                        onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="totals-row print-only no-print" style={{ display: 'none' }}>
                                    <span>Tax ({taxRate}%)</span>
                                    <span>${taxAmount.toFixed(2)}</span>
                                </div>
                                <div className="totals-row no-print" style={{ alignItems: 'center' }}>
                                    <span>Discount ($)</span>
                                    <input 
                                        type="number" 
                                        className="search-input text-right" 
                                        style={{ width: '80px', padding: '0.25rem 0.5rem' }}
                                        value={discount}
                                        min="0"
                                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="totals-row print-only no-print" style={{ display: 'none' }}>
                                    <span>Discount</span>
                                    <span>-${discount.toFixed(2)}</span>
                                </div>
                                
                                <div className="totals-row grand-total">
                                    <span>Amount Due</span>
                                    <span>${grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Patient & Meta Details */}
                        <div className="invoice-section" style={{ height: 'fit-content' }}>
                            <h3 style={{ margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FileText size={18} color="var(--accent)" /> Details
                            </h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Patient Name</label>
                                    <input 
                                        className="search-input" 
                                        placeholder="Search patient..." 
                                        value={patientName}
                                        onChange={(e) => setPatientName(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Invoice Date</label>
                                    <input 
                                        type="date"
                                        className="search-input" 
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div className="no-print">
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Quick Add Pre-Sets</label>
                                    <select className="search-input" style={{ width: '100%' }} onChange={(e) => {
                                        if (e.target.value) {
                                            const preset = DEFAULT_ITEMS.find(i => i.id === parseInt(e.target.value));
                                            if (preset) {
                                                setItems([...items, { id: Date.now(), desc: preset.desc, qty: 1, price: preset.cost }]);
                                            }
                                        }
                                        e.target.value = "";
                                    }}>
                                        <option value="">-- Select Standard Service --</option>
                                        {DEFAULT_ITEMS.map(item => (
                                            <option key={item.id} value={item.id}>{item.desc} (${item.cost})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <strong>Note:</strong> All payments are due within 30 days of the invoice date. Late fees of 1.5% may apply.
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InvoiceGenerator;
