import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import MedicalRecordsTimeline from '../medical-records/MedicalRecordsTimeline';
import { ArrowLeft, User, Phone, MapPin, Calendar, Activity, Edit, FileText, Clock, CreditCard } from 'lucide-react';

const PatientProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const res = await axios.get(`/patients/${id}`);
                setPatient(res.data.data);
            } catch (err) {
                console.error('Failed to load patient');
            } finally {
                setLoading(false);
            }
        };
        fetchPatient();
    }, [id]);

    if (loading) {
        return <DashboardLayout breadcrumb="Patient Profile"><div className="empty-state">Loading...</div></DashboardLayout>;
    }

    if (!patient) {
        return (
            <DashboardLayout breadcrumb="Patient Profile">
                <div className="empty-state">
                    <h3>Patient Not Found</h3>
                    <Link to="/admin/patients" className="btn btn-outline" style={{ marginTop: '1rem' }}>Go Back</Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout breadcrumb={`Patient: ${patient.first_name} ${patient.last_name}`}>
            <div className="patients-container">
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/admin/patients" className="btn-icon"><ArrowLeft size={18} /></Link>
                        <h1>Patient Profile</h1>
                    </div>
                    <Link to={`/admin/patients/${id}/edit`} className="btn btn-primary"><Edit size={16} /> Edit Profile</Link>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1.5rem', alignItems: 'start' }}>
                    
                    {/* Sidebar Profile Card */}
                    <div className="auth-card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <div style={{
                            width: '100px', height: '100px', borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', margin: '0 auto 1.5rem'
                        }}>
                            {patient.first_name[0]}{patient.last_name[0]}
                        </div>
                        <h2 style={{ marginBottom: '0.25rem' }}>{patient.first_name} {patient.last_name}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>ID: #{patient.id}</p>
                        
                        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px outset var(--border)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                <Phone size={16} color="var(--text-muted)" /> <span>{patient.phone}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                <User size={16} color="var(--text-muted)" /> <span>{patient.gender} | {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} yrs</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                                <Activity size={16} color="var(--danger)" /> <strong>Blood: {patient.blood_group || 'N/A'}</strong>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="auth-card" style={{ padding: 0, overflow: 'hidden' }}>
                        
                        {/* Tabs */}
                        <div style={{ display: 'flex', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                            {[
                                { id: 'info', icon: User, label: 'Personal Info' },
                                { id: 'history', icon: FileText, label: 'Medical History' },
                                { id: 'appointments', icon: Clock, label: 'Appointments' },
                                { id: 'bills', icon: CreditCard, label: 'Billing & Payments' }
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                    flex: 1, padding: '1rem', background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
                                    border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                                    color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                                    fontWeight: activeTab === tab.id ? '600' : '500', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s'
                                }}>
                                    <tab.icon size={16} /> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div style={{ padding: '2rem' }}>
                            {activeTab === 'info' && (
                                <div>
                                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>Detailed Information</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div>
                                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Email Address</label>
                                            <div style={{ fontWeight: '500' }}>{patient.email || 'No email provided'}</div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Date of Birth</label>
                                            <div style={{ fontWeight: '500' }}>{new Date(patient.date_of_birth).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Physical Address</label>
                                            <div style={{ fontWeight: '500', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                                <MapPin size={16} style={{ marginTop: '2px', color: 'var(--text-muted)' }}/> {patient.address || 'No address provided'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Simple Chart/Stat Box */}
                                    <h3 style={{ marginTop: '3rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Health Overview</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                        <div style={{ padding: '1.5rem', background: 'var(--bg)', borderRadius: '12px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem' }}>0</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Visits</div>
                                        </div>
                                        <div style={{ padding: '1.5rem', background: 'var(--bg)', borderRadius: '12px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)', marginBottom: '0.5rem' }}>0</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Prescriptions</div>
                                        </div>
                                        <div style={{ padding: '1.5rem', background: 'var(--bg)', borderRadius: '12px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)', marginBottom: '0.5rem' }}>$0</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pending Bills</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
                                    <MedicalRecordsTimeline patientId={id} />
                                </div>
                            )}

                            {activeTab === 'appointments' && (
                                <div className="empty-state">
                                    <Clock size={48} className="empty-icon" />
                                    <h3>No Appointments Scheduled</h3>
                                    <p>This patient has no upcoming or past appointments.</p>
                                </div>
                            )}

                            {activeTab === 'bills' && (
                                <div className="empty-state">
                                    <CreditCard size={48} className="empty-icon" />
                                    <h3>No Billing Records</h3>
                                    <p>All clear! This patient has no invoices or payment history.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PatientProfile;
