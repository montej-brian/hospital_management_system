import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import { ArrowLeft, User, Phone, MapPin, Calendar, Activity, Save } from 'lucide-react';
import '../../styles/patients.css';

const PatientForm = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [error, setError] = useState('');
    
    // Default form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'Male',
        phone: '',
        email: '',
        address: '',
        blood_group: ''
    });

    useEffect(() => {
        if (isEdit) {
            const fetchPatient = async () => {
                try {
                    const res = await axios.get(`/patients/${id}`);
                    const patient = res.data.data;
                    setFormData({
                        first_name: patient.first_name || '',
                        last_name: patient.last_name || '',
                        date_of_birth: patient.date_of_birth ? patient.date_of_birth.substring(0, 10) : '',
                        gender: patient.gender || 'Male',
                        phone: patient.phone || '',
                        email: patient.email || '',
                        address: patient.address || '',
                        blood_group: patient.blood_group || ''
                    });
                } catch (err) {
                    setError('Failed to fetch patient data.');
                } finally {
                    setFetching(false);
                }
            };
            fetchPatient();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (!formData.first_name || !formData.last_name || !formData.date_of_birth || !formData.phone) {
            setError('Please fill out all required fields (Name, DOB, Phone).');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        
        setLoading(true);
        setError('');
        try {
            if (isEdit) {
                await axios.put(`/patients/${id}`, formData);
            } else {
                await axios.post('/patients', formData);
            }
            navigate('/admin/patients');
        } catch (err) {
            setError(err.response?.data?.message || 'Check the form for errors and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout breadcrumb={isEdit ? 'Edit Patient' : 'Add New Patient'}>
            <div className="patients-container">
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/admin/patients" className="btn-icon">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1>{isEdit ? 'Edit Patient Details' : 'Register New Patient'}</h1>
                    </div>
                </div>

                <div className="auth-card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                    {fetching ? (
                        <div className="empty-state">Loading patient data...</div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {error && <div className="error-banner"><p>{error}</p></div>}
                            
                            <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Personal Information</h3>
                            
                            <div className="form-row-grid">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <div className="input-wrapper">
                                        <User className="input-icon" size={16} />
                                        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Last Name *</label>
                                    <div className="input-wrapper">
                                        <User className="input-icon" size={16} />
                                        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row-grid">
                                <div className="form-group">
                                    <label>Date of Birth *</label>
                                    <div className="input-wrapper">
                                        <Calendar className="input-icon" size={16} />
                                        <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <div className="input-wrapper" style={{ paddingLeft: '0' }}>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className="search-input" style={{ paddingLeft: '1rem' }}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ margin: '2rem 0 1.5rem', color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Contact & Medical</h3>
                            
                            <div className="form-row-grid">
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <div className="input-wrapper">
                                        <Phone className="input-icon" size={16} />
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <div className="input-wrapper">
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ paddingLeft: '1rem' }} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Home Address</label>
                                <div className="input-wrapper">
                                    <MapPin className="input-icon" size={16} />
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Blood Group</label>
                                <div className="input-wrapper">
                                    <Activity className="input-icon" size={16} />
                                    <select name="blood_group" value={formData.blood_group} onChange={handleChange} className="search-input" style={{ width: '100%' }}>
                                        <option value="">Unknown</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <Link to="/admin/patients" className="btn btn-outline" style={{ padding: '0.8rem 1.5rem' }}>Cancel</Link>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem' }} disabled={loading}>
                                    <Save size={18} /> {loading ? 'Saving...' : 'Save Patient'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PatientForm;
