import React from 'react';
import { FileText, Printer, Stethoscope, FilePlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_RECORDS = [
    {
        id: 1,
        date: '2026-03-01T10:30:00',
        doctorName: 'Sarah Jones',
        department: 'Cardiology',
        diagnosis: 'Mild Hypertension',
        notes: 'Patient reports occasional headaches. Advised to reduce sodium intake and monitor BP.',
        vitals: { bp: '135/85', hr: '78', weight: '82' },
        prescriptions: ['Lisinopril 10mg - 1x Daily'],
        labs: ['Basic Metabolic Panel (BMP)']
    },
    {
        id: 2,
        date: '2025-11-15T09:15:00',
        doctorName: 'Emily Chen',
        department: 'General Practice',
        diagnosis: 'Seasonal Allergies',
        notes: 'Congestion and runny nose. Prescribed antihistamines.',
        vitals: { bp: '120/80', temp: '37.1' },
        prescriptions: ['Cetirizine 10mg - As needed'],
        labs: []
    }
];

const MedicalRecordsTimeline = ({ patientId }) => {
    
    if (MOCK_RECORDS.length === 0) {
        return (
            <div className="empty-state">
                <FileText size={48} className="empty-icon" />
                <h3>No Medical Records Found</h3>
                <p>This patient doesn't have any medical history recorded yet.</p>
                <Link to={`/admin/patients/${patientId}/medical-records/new`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                    <FilePlus size={16} /> Add First Record
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: 'var(--text)', margin: 0 }}>Clinical History</h3>
                <Link to={`/admin/patients/${patientId}/medical-records/new`} className="btn btn-primary">
                    <FilePlus size={16} /> New Encounter
                </Link>
            </div>

            <div className="alert-banner info" style={{ marginBottom: '2rem' }}>
                <Stethoscope size={20} />
                <div>
                    <strong>Previous Visit Summary:</strong> Last seen on Mar 1, 2026 by Dr. Sarah Jones for Mild Hypertension.
                </div>
            </div>

            <div className="timeline">
                {MOCK_RECORDS.map(record => (
                    <div key={record.id} className="timeline-item">
                        <div className="timeline-marker"></div>
                        <div className="timeline-date">
                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        <div className="timeline-header">
                            <div>
                                <h4 className="timeline-title">{record.diagnosis}</h4>
                                <div className="timeline-doctor">Attending: Dr. {record.doctorName} ({record.department})</div>
                            </div>
                            <button className="btn-icon" title="Print Record" onClick={() => alert('Printing record...')}>
                                <Printer size={16} />
                            </button>
                        </div>

                        <div className="timeline-body">
                            {Object.keys(record.vitals).length > 0 && (
                                <div className="record-section" style={{ display: 'flex', gap: '1.5rem', background: '#f8fafc' }}>
                                    {record.vitals.bp && <div><span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>BP </span><strong>{record.vitals.bp}</strong></div>}
                                    {record.vitals.hr && <div><span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>HR </span><strong>{record.vitals.hr}</strong></div>}
                                    {record.vitals.temp && <div><span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Temp </span><strong>{record.vitals.temp}°C</strong></div>}
                                    {record.vitals.weight && <div><span style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Weight </span><strong>{record.vitals.weight}kg</strong></div>}
                                </div>
                            )}

                            <div className="record-section">
                                <h4>Clinical Notes</h4>
                                <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>{record.notes}</p>
                            </div>

                            {(record.prescriptions.length > 0 || record.labs.length > 0) && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {record.prescriptions.length > 0 && (
                                        <div className="record-section">
                                            <h4>Rx Prescriptions</h4>
                                            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                                                {record.prescriptions.map((rx, i) => <li key={i}>{rx}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {record.labs.length > 0 && (
                                        <div className="record-section">
                                            <h4>Lab Orders</h4>
                                            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
                                                {record.labs.map((lab, i) => <li key={i}>{lab}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MedicalRecordsTimeline;
