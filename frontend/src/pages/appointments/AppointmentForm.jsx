import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import { ArrowLeft, User, Calendar as CalIcon, Clock, AlignLeft, Save } from 'lucide-react';
import '../../styles/appointments.css';

const AppointmentForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Mock Data for Selects
    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    const [formData, setFormData] = useState({
        patient_id: '',
        doctor_id: '',
        appointment_date: new Date().toISOString().split('T')[0],
        time: '',
        reason: ''
    });

    useEffect(() => {
        // Fetch lookup data (patients & doctors)
        const fetchLookups = async () => {
            try {
                // If API isn't fully ready, use mock lists
                const ptsResponse = await axios.get('/patients').catch(() => ({ data: { data: getMockPatients() } }));
                setPatients(ptsResponse.data.data || []);
                
                // For doctors, we might need a specific role query or a separate /doctors endpoint
                const docsResponse = await axios.get('/doctors').catch(() => ({ data: { data: getMockDoctors() } }));
                setDoctors(docsResponse.data.data || []);
            } catch (err) {
                console.error('Failed to load form lookups', err);
            }
        };
        fetchLookups();
    }, []);

    // When doctor or date changes, simulate fetching available time slots
    useEffect(() => {
        if (formData.doctor_id && formData.appointment_date) {
            // Simulate API call to check doctor availability
            setAvailableSlots(generateMockTimeSlots());
            setFormData(prev => ({ ...prev, time: '' })); // reset time selection
        }
    }, [formData.doctor_id, formData.appointment_date]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTimeSelect = (timeSlot) => {
        setFormData({ ...formData, time: timeSlot.time });
    };

    const validate = () => {
        if (!formData.patient_id || !formData.doctor_id || !formData.appointment_date || !formData.time) {
            setError('Please complete all required fields (Patient, Doctor, Date, Time).');
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
            // Mocking API call for now if endpoint isn't fully ready
            await new Promise(resolve => setTimeout(resolve, 800)); 
            
            // await axios.post('/appointments', formData);
            alert('Appointment Scheduled Successfully! (Simulated)');
            navigate('/admin'); // Or wherever appropriate
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to schedule appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout breadcrumb="Book Appointment">
            <div className="patients-container">
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/admin" className="btn-icon">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1>Book New Appointment</h1>
                    </div>
                </div>

                <div className="auth-card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                    <form onSubmit={handleSubmit} className="booking-form">
                        {error && <div className="error-banner"><p>{error}</p></div>}
                        
                        <h3 style={{ color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Appointment Details</h3>
                        
                        <div className="form-row-grid">
                            <div className="form-group">
                                <label>Select Patient *</label>
                                <div className="input-wrapper">
                                    <User className="input-icon" size={16} />
                                    <select 
                                        name="patient_id" 
                                        value={formData.patient_id} 
                                        onChange={handleChange} 
                                        className="search-input" 
                                        style={{ width: '100%', paddingLeft: '2.5rem' }}
                                        required
                                    >
                                        <option value="">-- Search / Select Patient --</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.first_name} {p.last_name} (ID: {p.id})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Assign Doctor *</label>
                                <div className="input-wrapper">
                                    <User className="input-icon" size={16} />
                                    <select 
                                        name="doctor_id" 
                                        value={formData.doctor_id} 
                                        onChange={handleChange} 
                                        className="search-input" 
                                        style={{ width: '100%', paddingLeft: '2.5rem' }}
                                        required
                                    >
                                        <option value="">-- Select Doctor --</option>
                                        {doctors.map(d => (
                                            <option key={d.id} value={d.id}>Dr. {d.name} ({d.department})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-row-grid">
                            <div className="form-group">
                                <label>Appointment Date *</label>
                                <div className="input-wrapper">
                                    <CalIcon className="input-icon" size={16} />
                                    <input 
                                        type="date" 
                                        name="appointment_date" 
                                        value={formData.appointment_date} 
                                        onChange={handleChange} 
                                        min={new Date().toISOString().split('T')[0]} // prevent past dates
                                        required 
                                    />
                                </div>
                            </div>
                        </div>

                        {formData.doctor_id && formData.appointment_date && (
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Clock size={16} color="var(--accent)" /> Available Time Slots *
                                </label>
                                <div className="time-slot-grid">
                                    {availableSlots.map((slot, index) => (
                                        <div 
                                            key={index}
                                            className={`time-slot ${slot.booked ? 'booked' : ''} ${formData.time === slot.time ? 'selected' : ''}`}
                                            onClick={() => !slot.booked && handleTimeSelect(slot)}
                                            title={slot.booked ? 'Slot already booked' : 'Click to select'}
                                        >
                                            {slot.time}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label>Reason for Visit (Optional)</label>
                            <div className="input-wrapper" style={{ alignItems: 'flex-start' }}>
                                <AlignLeft className="input-icon" size={16} style={{ top: '16px' }} />
                                <textarea 
                                    name="reason" 
                                    value={formData.reason} 
                                    onChange={handleChange} 
                                    className="search-input"
                                    style={{ width: '100%', paddingLeft: '2.5rem', minHeight: '100px', resize: 'vertical' }}
                                    placeholder="Brief description of patient's symptoms or reason for appointment..."
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                            <Link to="/admin" className="btn btn-outline" style={{ padding: '0.8rem 1.5rem' }}>Cancel</Link>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem' }} disabled={loading}>
                                <Save size={18} /> {loading ? 'Booking...' : 'Confirm Appointment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

// --- Dummy Data Generators (since backend endpoints might not be complete) ---
function getMockPatients() {
    return [
        { id: 101, first_name: 'John', last_name: 'Doe' },
        { id: 102, first_name: 'Alice', last_name: 'Smith' },
        { id: 103, first_name: 'Bob', last_name: 'Martin' },
        { id: 104, first_name: 'Emma', last_name: 'Stone' }
    ];
}

function getMockDoctors() {
    return [
        { id: 201, name: 'Sarah Jones', department: 'Cardiology' },
        { id: 202, name: 'Mike Tyson', department: 'Neurology' },
        { id: 203, name: 'Emily Chen', department: 'Pediatrics' }
    ];
}

function generateMockTimeSlots() {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
        // Generate e.g., "9:00 AM" and "9:30 AM"
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        
        slots.push({ time: `${displayHour}:00 ${ampm}`, booked: Math.random() > 0.7 });
        slots.push({ time: `${displayHour}:30 ${ampm}`, booked: Math.random() > 0.7 });
    }
    return slots;
}

export default AppointmentForm;
