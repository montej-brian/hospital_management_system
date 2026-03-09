import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import DashboardLayout from '../../components/DashboardLayout';
import Modal from '../../components/Modal';
import { 
    Search, Plus, Filter, Download, 
    MoreHorizontal, Edit, Trash2, Eye, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import '../../styles/patients.css';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterGender, setFilterGender] = useState('');
    
    // Delete Modal state
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [patientToDelete, setPatientToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 10;

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        try {
            // Build query params
            const params = new URLSearchParams({
                page: currentPage,
                limit: limit,
            });
            if (searchTerm) params.append('search', searchTerm);
            if (filterGender) params.append('gender', filterGender);

            const response = await axios.get(`/patients?${params.toString()}`);
            setPatients(response.data.data);
            setCurrentPage(response.data.meta.currentPage);
            setTotalPages(response.data.meta.totalPages);
            setTotalRecords(response.data.meta.totalRecords);
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterGender]);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchPatients();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchPatients]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handleFilterChange = (e) => {
        setFilterGender(e.target.value);
        setCurrentPage(1);
    };

    const handleExport = () => {
        // Simplified CSV export
        if (!patients.length) return;
        const headers = ['ID,First Name,Last Name,Gender,Phone,Blood Group\n'];
        const csvRows = patients.map(p => 
            `${p.id},${p.first_name},${p.last_name},${p.gender},${p.phone},${p.blood_group || 'N/A'}`
        );
        const csvContent = headers.concat(csvRows).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `patients_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDeleteClick = (patient) => {
        setPatientToDelete(patient);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!patientToDelete) return;
        setIsDeleting(true);
        try {
            await axios.delete(`/patients/${patientToDelete.id}`);
            setDeleteModalOpen(false);
            fetchPatients(); // refresh list
        } catch (error) {
            console.error('Failed to delete patient:', error);
            alert('Failed to delete patient. Ensure they have no dependent records.');
        } finally {
            setIsDeleting(false);
            setPatientToDelete(null);
        }
    };

    return (
        <DashboardLayout breadcrumb="Patients">
            <div className="patients-container">
                <div className="page-header">
                    <h1>Patients Repository</h1>
                    <div className="action-buttons">
                        <button className="btn btn-outline" onClick={handleExport}>
                            <Download size={18} /> Export CSV
                        </button>
                        <Link to="/admin/patients/new" className="btn btn-primary">
                            <Plus size={18} /> Add Patient
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <Search className="search-icon" size={18} />
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Search patients by name, ID or phone..." 
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className="filter-group">
                        <Filter size={18} color="var(--text-muted)" />
                        <select className="filter-select" value={filterGender} onChange={handleFilterChange}>
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container">
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Gender / Age</th>
                                    <th>Contact</th>
                                    <th>Blood Group</th>
                                    <th>Registered Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="empty-state">Loading patients...</td>
                                    </tr>
                                ) : patients.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="empty-state">
                                            <div className="empty-icon"><Search size={48} /></div>
                                            <h3>No patients found</h3>
                                            <p>Try adjusting your search or filters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    patients.map(patient => (
                                        <tr key={patient.id}>
                                            <td>
                                                <div className="patient-cell">
                                                    <div className="patient-avatar">
                                                        {patient.first_name[0]}{patient.last_name[0]}
                                                    </div>
                                                    <div className="patient-info">
                                                        <div className="name">{patient.first_name} {patient.last_name}</div>
                                                        <div className="id">ID: #{patient.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>{patient.gender}</div>
                                                <div className="id" style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                                                    {new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()} yrs
                                                </div>
                                            </td>
                                            <td> {patient.phone} </td>
                                            <td>
                                                <span className={`status-badge active`}>
                                                    {patient.blood_group || 'Unknown'}
                                                </span>
                                            </td>
                                            <td>{new Date(patient.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <Link to={`/admin/patients/${patient.id}`} className="btn-icon" title="View Profile">
                                                        <Eye size={16} />
                                                    </Link>
                                                    <Link to={`/admin/patients/${patient.id}/edit`} className="btn-icon" title="Edit">
                                                        <Edit size={16} />
                                                    </Link>
                                                    <button className="btn-icon delete" title="Delete" onClick={() => handleDeleteClick(patient)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && patients.length > 0 && (
                        <div className="pagination">
                            <div className="page-info">
                                Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords} entries
                            </div>
                            <div className="page-controls">
                                <button 
                                    className="page-btn" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i+1} 
                                        className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button 
                                    className="page-btn" 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal 
                isOpen={deleteModalOpen}
                onClose={() => !isDeleting && setDeleteModalOpen(false)}
                title="Confirm Deletion"
            >
                <div>
                    <div style={{ display: 'flex', gap: '1rem', color: 'var(--danger)', marginBottom: '1.5rem', background: '#fee2e2', padding: '1rem', borderRadius: '8px' }}>
                        <AlertTriangle size={24} />
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#991b1b' }}>
                            Are you sure you want to delete patient <strong>{patientToDelete?.first_name} {patientToDelete?.last_name}</strong>? This action cannot be undone and will remove all associated records.
                        </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                        <button className="btn btn-outline" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>Cancel</button>
                        <button className="btn btn-danger" onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Yes, Delete Patient'}
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export default PatientList;
