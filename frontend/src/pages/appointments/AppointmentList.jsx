import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { 
    Search, Plus, Filter, Calendar as CalIcon, 
    ChevronLeft, ChevronRight, Printer, CheckCircle, XCircle 
} from 'lucide-react';
import '../../styles/appointments.css';
import '../../styles/patients.css'; // Reuse table styles

const AppointmentList = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Status Update Modal
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [updating, setUpdating] = useState(false);

    // Print Modal
    const [printModalOpen, setPrintModalOpen] = useState(false);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch all for current month for calendar, or paginated for list (simplifying to all for now)
            const response = await axios.get('/appointments');
            setAppointments(response.data.data || []);
        } catch (error) {
            console.error('API Error:', error);
            // Fallback mock data if API fails to hit specific endpoints
            if (error.response?.status === 404) {
                setAppointments(getMockAppointments());
            }
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleStatusUpdate = async () => {
        if (!selectedAppt || !newStatus) return;
        setUpdating(true);
        try {
            // Mocking API call for now if endpoint isn't fully ready
            await new Promise(resolve => setTimeout(resolve, 500)); 
            
            // await axios.patch(`/appointments/${selectedAppt.id}/status`, { status: newStatus });
            
            // Update local state temporarily
            setAppointments(prev => prev.map(a => a.id === selectedAppt.id ? { ...a, status: newStatus } : a));
            setStatusModalOpen(false);
        } catch (error) {
            alert('Failed to update status.');
        } finally {
            setUpdating(false);
            setSelectedAppt(null);
        }
    };

    const handlePrint = (appt) => {
        setSelectedAppt(appt);
        setPrintModalOpen(true);
    };

    // --- Custom Calendar Logic ---
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const generateCalendarGrid = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        
        const days = [];
        // Empty slots before 1st day
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        // Actual days
        for (let d = 1; d <= daysInMonth; d++) {
            days.push(new Date(year, month, d));
        }
        return days;
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const today = () => setCurrentDate(new Date());

    const isToday = (date) => {
        const now = new Date();
        return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    };

    const getAppointmentsForDate = (date) => {
        return appointments.filter(a => {
            const apptDate = new Date(a.appointment_date);
            return apptDate.getDate() === date.getDate() && 
                   apptDate.getMonth() === date.getMonth() && 
                   apptDate.getFullYear() === date.getFullYear();
        });
    };

    return (
        <DashboardLayout breadcrumb="Appointments">
            <div className="patients-container">
                <div className="page-header">
                    <h1>Appointments</h1>
                    <div className="action-buttons">
                        <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border)' }}>
                            <button 
                                className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`} 
                                style={{ border: 'none', background: viewMode === 'list' ? 'var(--accent)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text)' }}
                                onClick={() => setViewMode('list')}
                            >
                                List View
                            </button>
                            <button 
                                className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline'}`}
                                style={{ border: 'none', background: viewMode === 'calendar' ? 'var(--accent)' : 'transparent', color: viewMode === 'calendar' ? 'white' : 'var(--text)' }}
                                onClick={() => setViewMode('calendar')}
                            >
                                <CalIcon size={16} /> Calendar
                            </button>
                        </div>
                        <Link to="/admin/appointments/new" className="btn btn-primary">
                            <Plus size={18} /> Book Appointment
                        </Link>
                    </div>
                </div>

                {viewMode === 'calendar' ? (
                    <div className="calendar-widget">
                        <div className="calendar-header">
                            <h2>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                            <div className="calendar-nav">
                                <button className="btn btn-outline" onClick={today}>Today</button>
                                <button className="btn-icon" onClick={prevMonth}><ChevronLeft size={18} /></button>
                                <button className="btn-icon" onClick={nextMonth}><ChevronRight size={18} /></button>
                            </div>
                        </div>
                        <div className="calendar-grid">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                <div key={day} className="calendar-day-header">{day}</div>
                            ))}
                            {generateCalendarGrid().map((date, idx) => (
                                <div key={idx} className={`calendar-cell ${!date ? 'empty' : ''} ${date && isToday(date) ? 'today' : ''}`}>
                                    {date && (
                                        <>
                                            <div className="date-num">{date.getDate()}</div>
                                            {getAppointmentsForDate(date).map(appt => (
                                                <div 
                                                    key={appt.id} 
                                                    className={`calendar-event ${appt.status?.toLowerCase()}`}
                                                    title={`${appt.time} - ${appt.patient_name}`}
                                                    onClick={() => { setSelectedAppt(appt); setStatusModalOpen(true); }}
                                                >
                                                    {appt.time} {appt.patient_name}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="table-container">
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Date & Time</th>
                                        <th>Patient</th>
                                        <th>Doctor (Dept)</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="empty-state">No appointments scheduled.</td>
                                        </tr>
                                    ) : (
                                        appointments.map(appt => (
                                            <tr key={appt.id}>
                                                <td>
                                                    <div style={{ fontWeight: '500' }}>{new Date(appt.appointment_date).toLocaleDateString()}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{appt.time}</div>
                                                </td>
                                                <td style={{ fontWeight: '500' }}>{appt.patient_name}</td>
                                                <td>
                                                    <div>Dr. {appt.doctor_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{appt.department}</div>
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${appt.status?.toLowerCase()}`}>
                                                        {appt.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button 
                                                            className="btn-icon" 
                                                            title="Update Status"
                                                            onClick={() => { setSelectedAppt(appt); newStatus === ''; setStatusModalOpen(true); }}
                                                        >
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button 
                                                            className="btn-icon" 
                                                            title="Print Slip"
                                                            onClick={() => handlePrint(appt)}
                                                        >
                                                            <Printer size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Update Modal */}
            <Modal 
                isOpen={statusModalOpen} 
                onClose={() => setStatusModalOpen(false)} 
                title="Update Appointment"
            >
                {selectedAppt && (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ background: 'var(--bg)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                            <p><strong>Patient:</strong> {selectedAppt.patient_name}</p>
                            <p><strong>Time:</strong> {new Date(selectedAppt.appointment_date).toLocaleDateString()} at {selectedAppt.time}</p>
                            <p><strong>Current Status:</strong> <span className={`status-badge ${selectedAppt.status?.toLowerCase()}`}>{selectedAppt.status}</span></p>
                        </div>
                        
                        <div className="form-group">
                            <label>New Status</label>
                            <select 
                                className="search-input" 
                                style={{ width: '100%', paddingLeft: '1rem' }}
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                            >
                                <option value="">Select status...</option>
                                <option value="Scheduled">Scheduled (Confirm)</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                            <button className="btn btn-outline" onClick={() => setStatusModalOpen(false)}>Close</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleStatusUpdate}
                                disabled={!newStatus || updating}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Print Slip Modal */}
            <Modal 
                isOpen={printModalOpen} 
                onClose={() => setPrintModalOpen(false)} 
                title="Print Appointment Slip"
            >
                {selectedAppt && (
                    <div>
                        <div className="slip-content" id="print-slip">
                            <div className="slip-header">
                                <div className="slip-hospital-name">City General Hospital</div>
                                <div style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '4px' }}>123 Health Ave, Medical District</div>
                                <h3 style={{ marginTop: '1rem', fontSize: '1.1rem' }}>Appointment Confirmation</h3>
                            </div>
                            
                            <div className="slip-detail-row">
                                <span className="slip-detail-label">Patient Name:</span>
                                <span className="slip-detail-value">{selectedAppt.patient_name}</span>
                            </div>
                            <div className="slip-detail-row">
                                <span className="slip-detail-label">Doctor:</span>
                                <span className="slip-detail-value">Dr. {selectedAppt.doctor_name}</span>
                            </div>
                            <div className="slip-detail-row">
                                <span className="slip-detail-label">Department:</span>
                                <span className="slip-detail-value">{selectedAppt.department}</span>
                            </div>
                            <div className="slip-detail-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                                <span className="slip-detail-label">Date:</span>
                                <span className="slip-detail-value">{new Date(selectedAppt.appointment_date).toLocaleDateString()}</span>
                            </div>
                            <div className="slip-detail-row">
                                <span className="slip-detail-label">Time:</span>
                                <span className="slip-detail-value">{selectedAppt.time}</span>
                            </div>
                            <div className="slip-detail-row">
                                <span className="slip-detail-label">Status:</span>
                                <span className="slip-detail-value">{selectedAppt.status}</span>
                            </div>
                            
                            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
                                Please arrive 15 minutes before your scheduled time.<br/>
                                This is a computer generated slip.
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                            <button className="btn btn-outline" onClick={() => setPrintModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={() => {
                                alert('In a real app, this would trigger window.print() on the slip content.');
                                setPrintModalOpen(false);
                            }}>
                                <Printer size={18} /> Print Slip
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
};

// Dummy Data Generator for UI
function getMockAppointments() {
    const today = new Date();
    const tmrw = new Date(today); tmrw.setDate(tmrw.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 5);

    return [
        { id: 1, patient_name: 'John Doe', doctor_name: 'Sarah Jones', department: 'Cardiology', appointment_date: today.toISOString(), time: '10:00 AM', status: 'Scheduled' },
        { id: 2, patient_name: 'Alice Smith', doctor_name: 'Mike Tyson', department: 'Neurology', appointment_date: today.toISOString(), time: '02:30 PM', status: 'Completed' },
        { id: 3, patient_name: 'Bob Martin', doctor_name: 'Sarah Jones', department: 'Cardiology', appointment_date: tmrw.toISOString(), time: '09:00 AM', status: 'Scheduled' },
        { id: 4, patient_name: 'Emma Stone', doctor_name: 'Mike Tyson', department: 'Neurology', appointment_date: tmrw.toISOString(), time: '11:15 AM', status: 'Cancelled' },
        { id: 5, patient_name: 'Chris Evans', doctor_name: 'Sarah Jones', department: 'Cardiology', appointment_date: nextWeek.toISOString(), time: '01:00 PM', status: 'Scheduled' },
    ];
}

export default AppointmentList;
