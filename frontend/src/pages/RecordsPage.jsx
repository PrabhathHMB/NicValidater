import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Search, Filter, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export default function RecordsPage() {
    const location = useLocation();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [fileFilter, setFileFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [filenames, setFilenames] = useState([]);
    const [page, setPage] = useState(0);
    const PAGE_SIZE = 20;

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const valid = query.get('valid');
        if (valid === 'true') setStatusFilter('true');
        else if (valid === 'false') setStatusFilter('false');
    }, [location.search]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const params = {};
            if (genderFilter) params.gender = genderFilter;
            if (fileFilter) params.fileName = fileFilter;
            if (statusFilter !== '') params.isValid = statusFilter;
            const res = await axios.get('/api/nic/records', { params });
            const data = res.data || [];
            setRecords(data);
            const names = [...new Set(data.map(r => r.fileName).filter(Boolean))];
            setFilenames(names);
        } catch (e) {
            toast.error('Failed to fetch records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRecords(); }, [genderFilter, fileFilter, statusFilter]);

    const filtered = records.filter(r => {
        if (!search) return true;
        const q = search.toLowerCase();
        return r.nicNumber?.toLowerCase().includes(q) || r.gender?.toLowerCase().includes(q) || r.fileName?.toLowerCase().includes(q);
    });

    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

    return (
        <div>
            <div className="page-header">
                <h1>NIC Records</h1>
                <p>View, search and filter all validated NIC records</p>
            </div>

            <div className="card">
                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="search-input-wrap">
                        <Search size={14} className="search-icon" />
                        <input
                            placeholder="Search NIC, gender, file..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(0); }}
                        />
                    </div>

                    <select className="filter-select" value={genderFilter} onChange={e => { setGenderFilter(e.target.value); setPage(0); }}>
                        <option value="">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>

                    <select className="filter-select" value={fileFilter} onChange={e => { setFileFilter(e.target.value); setPage(0); }}>
                        <option value="">All Files</option>
                        {filenames.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    
                    <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0); }}>
                        <option value="">All Statuses</option>
                        <option value="true">Valid Only</option>
                        <option value="false">Invalid Only</option>
                    </select>

                    <button className="btn btn-secondary" onClick={fetchRecords} title="Refresh">
                        <RefreshCw size={14} /> Refresh
                    </button>

                    <span style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{filtered.length}</strong> records
                    </span>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '12px', color: 'var(--text-secondary)' }}>
                        <span className="spinner" /> Loading records...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                        <div style={{ fontWeight: 600, marginBottom: '6px' }}>No records found</div>
                        <div style={{ fontSize: '13px' }}>Upload CSV files to see NIC records here</div>
                    </div>
                ) : (
                    <>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#ID</th>
                                        <th>NIC Number</th>
                                        <th>Birthday</th>
                                        <th>Age</th>
                                        <th>Gender</th>
                                        <th>Format</th>
                                        <th>File</th>
                                        <th>Status</th>
                                        <th>Validated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.map((r, i) => (
                                        <tr key={r.id}>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{page * PAGE_SIZE + i + 1}</td>
                                            <td style={{ fontWeight: 600, fontFamily: 'monospace', color: 'var(--accent-blue-light)' }}>{r.nicNumber}</td>
                                            <td>{r.birthday || '—'}</td>
                                            <td>{r.age ?? '—'}</td>
                                            <td>
                                                {r.gender && (
                                                    <span className={`badge ${r.gender === 'Male' ? 'badge-blue' : 'badge-purple'}`}>{r.gender}</span>
                                                )}
                                            </td>
                                            <td>{r.nicFormat && <span className="badge badge-cyan">{r.nicFormat}</span>}</td>
                                            <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {r.fileName}
                                            </td>
                                            <td>
                                                {r.isValid ? (
                                                    <span style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                                                        <CheckCircle size={14} /> Valid
                                                    </span>
                                                ) : (
                                                    <span style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }} title={r.errorMessage}>
                                                        <XCircle size={14} /> Invalid
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                                {r.validatedAt ? new Date(r.validatedAt).toLocaleDateString() : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
                                <button className="btn btn-secondary" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                                    ← Prev
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const p = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                                    return (
                                        <button key={p} className={`btn ${p === page ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPage(p)}
                                            style={{ minWidth: '36px', justifyContent: 'center', padding: '8px' }}>
                                            {p + 1}
                                        </button>
                                    );
                                })}
                                <button className="btn btn-secondary" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                                    Next →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
