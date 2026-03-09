import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { 
    ArrowLeft, Activity, Thermometer, Heart, FileText, 
    Pill, TestTube, Save, AlertTriangle, Printer, Bold, Italic, List
} from 'lucide-react';
import '../../styles/medical-records.css';

// Mock Databases
const MOCK_MEDICINES = [
    { id: 1, name: 'Amoxicillin', type: 'Antibiotic', standardDose: '500mg' },
    { id: 2, name: 'Ibuprofen', type: 'NSAID', standardDose: '400mg' },
    { id: 3, name: 'Lisinopril', type: 'ACE Inhibitor', standardDose: '10mg' },
    { id: 4, name: 'Metformin', type: 'Antidiabetic', standardDose: '500mg' },
    { id: 5, name: 'Atorvastatin', type: 'Statin', standardDose: '20mg' },
    { id: 6, name: 'Omeprazole', type: 'PPI', standardDose: '20mg' },
    { id: 7, name: 'Warfarin', type: 'Anticoagulant', standardDose: '5mg' },
    { id: 8, name: 'Aspirin', type: 'NSAID / Antiplatelet', standardDose: '81mg' }
];

const LAB_TESTS = [
    'Complete Blood Count (CBC)', 'Basic Metabolic Panel (BMP)',
    'Comprehensive Metabolic Panel (CMP)', 'Lipid Panel',
    'Thyroid Stimulating Hormone (TSH)', 'Urinalysis', 'HbA1c'
];

const MedicalRecordForm = () => {
    const { id: patientId } = useParams();
    const navigate = useNavigate();
    
    // --- States ---
    const [vitals, setVitals] = useState({ bp: '', hr: '', temp: '', weight: '', height: '' });
    const [notes, setNotes] = useState('');
    const [prescriptions, setPrescriptions] = useState([]);
    const [labOrders, setLabOrders] = useState([]);
    
    // Autocomplete State
    const [medicineSearch, setMedicineSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // Interactions
    const [interactionWarnings, setInteractionWarnings] = useState([]);
    
    const notesRef = useRef(null);

    // --- Handlers ---
    const handleVitalsChange = (e) => setVitals({ ...vitals, [e.target.name]: e.target.value });

    // Rich Text Mock
    const insertFormat = (format) => {
        if (!notesRef.current) return;
        const start = notesRef.current.selectionStart;
        const end = notesRef.current.selectionEnd;
        const text = notes;
        let newText = text;
        
        switch(format) {
            case 'bold': newText = text.substring(0, start) + '**' + text.substring(start, end) + '**' + text.substring(end); break;
            case 'italic': newText = text.substring(0, start) + '*' + text.substring(start, end) + '*' + text.substring(end); break;
            case 'list': newText = text.substring(0, start) + '\n- ' + text.substring(start, end) + text.substring(end); break;
            default: break;
        }
        setNotes(newText);
        notesRef.current.focus();
    };

    // Prescription Logic
    const filteredMedicines = MOCK_MEDICINES.filter(m => 
        m.name.toLowerCase().includes(medicineSearch.toLowerCase())
    );

    const addPrescription = (medicine) => {
        // Dosage Calculator Simulation: If weight is > 80kg, suggest higher dose
        let recommendedDose = medicine.standardDose;
        if (vitals.weight && parseInt(vitals.weight) > 80 && medicine.standardDose === '500mg') {
            recommendedDose = '800mg (Adjusted for weight)';
        }

        const newRx = {
            id: Date.now(),
            medicineId: medicine.id,
            name: medicine.name,
            dosage: recommendedDose,
            frequency: '1x Daily',
            duration: '7 Days'
        };
        
        const updatedRx = [...prescriptions, newRx];
        setPrescriptions(updatedRx);
        setMedicineSearch('');
        setShowSuggestions(false);
        checkInteractions(updatedRx);
    };

    const removePrescription = (id) => {
        const updatedRx = prescriptions.filter(p => p.id !== id);
        setPrescriptions(updatedRx);
        checkInteractions(updatedRx);
    };

    const checkInteractions = (currentRx) => {
        const names = currentRx.map(p => p.name);
        if (names.includes('Warfarin') && names.includes('Aspirin')) {
            setInteractionWarnings(['WARNING: Major interaction between Warfarin and Aspirin (Increased risk of bleeding).']);
        } else {
            setInteractionWarnings([]);
        }
    };

    // Lab Logic
    const toggleLab = (test) => {
        if (labOrders.includes(test)) {
            setLabOrders(labOrders.filter(t => t !== test));
        } else {
            setLabOrders([...labOrders, test]);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        alert('Medical Record Saved Successfully!');
        navigate(`/admin/patients/${patientId}`);
    };

    return (
        <DashboardLayout breadcrumb="New Medical Record">
            <div className="patients-container">
                <div className="page-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Link to={`/admin/patients/${patientId}`} className="btn-icon">
                            <ArrowLeft size={18} />
                        </Link>
                        <h1>Add Clinical Encounter</h1>
                    </div>
                    <button className="btn btn-outline" onClick={() => window.print()}>
                        <Printer size={16} /> Print Draft
                    </button>
                </div>

                {/* Mock Allergy Banner */}
                <div className="alert-banner danger">
                    <AlertTriangle size={20} />
                    <div>
                        <strong>Allergy Alert:</strong> Patient has a known severe allergy to <strong>Penicillin</strong>.
                    </div>
                </div>

                <form onSubmit={handleSave}>
                    {/* Vitals */}
                    <div className="medical-form-section">
                        <div className="medical-form-header">
                            <Activity size={20} />
                            <h3>Vital Signs</h3>
                        </div>
                        <div className="vitals-grid">
                            <div className="vitals-input">
                                <Heart size={16} color="var(--text-muted)" style={{marginRight: '8px'}} />
                                <input name="bp" placeholder="BP (e.g. 120/80)" value={vitals.bp} onChange={handleVitalsChange} />
                                <span className="vitals-unit">mmHg</span>
                            </div>
                            <div className="vitals-input">
                                <Activity size={16} color="var(--text-muted)" style={{marginRight: '8px'}} />
                                <input name="hr" placeholder="Heart Rate" type="number" value={vitals.hr} onChange={handleVitalsChange} />
                                <span className="vitals-unit">bpm</span>
                            </div>
                            <div className="vitals-input">
                                <Thermometer size={16} color="var(--text-muted)" style={{marginRight: '8px'}} />
                                <input name="temp" placeholder="Temp" type="number" step="0.1" value={vitals.temp} onChange={handleVitalsChange} />
                                <span className="vitals-unit">°C</span>
                            </div>
                            <div className="vitals-input">
                                <input name="weight" placeholder="Weight" type="number" value={vitals.weight} onChange={handleVitalsChange} style={{paddingLeft: '8px'}} />
                                <span className="vitals-unit">kg</span>
                            </div>
                        </div>
                    </div>

                    {/* Clinical Notes (Rich Text Simulation) */}
                    <div className="medical-form-section">
                        <div className="medical-form-header">
                            <FileText size={20} />
                            <h3>Clinical Notes (Symptoms & Diagnosis)</h3>
                        </div>
                        <div className="rich-text-container">
                            <div className="rich-text-toolbar">
                                <button type="button" className="rt-btn" onClick={() => insertFormat('bold')}><Bold size={16} /></button>
                                <button type="button" className="rt-btn" onClick={() => insertFormat('italic')}><Italic size={16} /></button>
                                <button type="button" className="rt-btn" onClick={() => insertFormat('list')}><List size={16} /></button>
                            </div>
                            <textarea 
                                ref={notesRef}
                                className="rich-text-area"
                                placeholder="Enter Chief Complaint, HPI, Assessment, and Plan..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Prescription Builder */}
                    <div className="medical-form-section">
                        <div className="medical-form-header">
                            <Pill size={20} />
                            <h3>E-Prescribe</h3>
                        </div>
                        
                        <div className="autocomplete-wrapper" style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Search for medicine (e.g. Amox...)" 
                                value={medicineSearch}
                                onChange={(e) => {
                                    setMedicineSearch(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                style={{ width: '100%', paddingLeft: '1rem' }}
                            />
                            {showSuggestions && medicineSearch && (
                                <div className="autocomplete-dropdown">
                                    {filteredMedicines.length > 0 ? filteredMedicines.map(med => (
                                        <div key={med.id} className="autocomplete-item" onClick={() => addPrescription(med)}>
                                            <div style={{ fontWeight: '500' }}>{med.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 'normal' }}>({med.type})</span></div>
                                        </div>
                                    )) : (
                                        <div className="autocomplete-item" style={{ color: 'var(--text-muted)' }}>No matches found.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {prescriptions.length > 0 && (
                            <div className="prescription-list">
                                {prescriptions.map(rx => (
                                    <div key={rx.id} className="prescription-item">
                                        <div style={{ fontWeight: '600' }}>{rx.name}</div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dosage</label>
                                            <input type="text" className="search-input" value={rx.dosage} onChange={(e) => setPrescriptions(prescriptions.map(p => p.id === rx.id ? {...p, dosage: e.target.value} : p))} style={{ width: '100%', paddingLeft: '0.5rem', paddingRight: '0.5rem' }} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Frequency</label>
                                            <select className="search-input" value={rx.frequency} onChange={(e) => setPrescriptions(prescriptions.map(p => p.id === rx.id ? {...p, frequency: e.target.value} : p))} style={{ width: '100%' }}>
                                                <option>1x Daily</option>
                                                <option>2x Daily</option>
                                                <option>3x Daily</option>
                                                <option>As needed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration</label>
                                            <input type="text" className="search-input" value={rx.duration} onChange={(e) => setPrescriptions(prescriptions.map(p => p.id === rx.id ? {...p, duration: e.target.value} : p))} style={{ width: '100%', paddingLeft: '0.5rem', paddingRight: '0.5rem' }} />
                                        </div>
                                        <button type="button" className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => removePrescription(rx.id)}>Remove</button>
                                    </div>
                                ))}
                                
                                {interactionWarnings.map((warn, i) => (
                                    <div key={i} className="drug-warning">
                                        <AlertTriangle size={16} /> {warn}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Lab Orders */}
                    <div className="medical-form-section">
                        <div className="medical-form-header">
                            <TestTube size={20} />
                            <h3>Lab Orders</h3>
                        </div>
                        <div className="lab-checklist">
                            {LAB_TESTS.map(test => (
                                <label key={test} className="lab-checkbox">
                                    <input 
                                        type="checkbox" 
                                        checked={labOrders.includes(test)}
                                        onChange={() => toggleLab(test)}
                                    />
                                    {test}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" className="btn btn-outline" onClick={() => navigate(`/admin/patients/${patientId}`)}>Discard</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                            <Save size={18} /> Save & Finalize Record
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default MedicalRecordForm;
