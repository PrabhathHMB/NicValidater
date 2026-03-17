import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    ArcElement, Tooltip, Legend, Title
} from 'chart.js';
import { Users, UserCheck, UserX, FileText, TrendingUp, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const chartOptions = {
    responsive: true,
    plugins: {
        legend: { labels: { color: '#8892b0', font: { size: 12 } } },
        tooltip: { backgroundColor: '#141d35', borderColor: '#4f7bff33', borderWidth: 1 }
    },
    scales: {
        x: { ticks: { color: '#8892b0' }, grid: { color: '#ffffff08' } },
        y: { ticks: { color: '#8892b0' }, grid: { color: '#ffffff08' }, beginAtZero: true }
    }
};

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/dashboard/summary');
            setStats(res.data.stats);
            setFiles(res.data.files || []);
        } catch (e) {
            setError('Failed to load dashboard data. Make sure all services are running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteFile = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? This will also remove all validated NIC records associated with this file.`)) {
            return;
        }

        try {
            await axios.delete(`/api/files/${id}`);
            toast.success('File and associated records deleted');
            fetchData(); // Refresh stats and list
        } catch (err) {
            toast.error('Failed to delete file');
        }
    };

    const handleEditFile = async (id, currentName) => {
        const newName = window.prompt('Enter new name for the file:', currentName);
        if (!newName || newName === currentName) return;

        try {
            await axios.put(`/api/files/${id}`, { fileName: newName });
            toast.success('File renamed successfully');
            fetchData();
        } catch (err) {
            toast.error('Failed to rename file');
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '12px', color: 'var(--text-secondary)' }}>
            <span className="spinner" /> Loading dashboard...
        </div>
    );

    if (error) return (
        <div style={{ padding: '24px' }}>
            <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <AlertCircle size={20} color="var(--accent-red)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>Connection Error</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{error}</div>
                </div>
            </div>
        </div>
    );

    const total = stats?.totalRecords ?? 0;
    const male = stats?.maleCount ?? 0;
    const female = stats?.femaleCount ?? 0;
    const valid = stats?.validCount ?? 0;

    const byFile = (stats?.byFile || []).map(r => ({ label: r[0], value: Number(r[1]) }));
    const barData = {
        labels: byFile.map(f => f.label),
        datasets: [{
            label: 'Records',
            data: byFile.map(f => f.value),
            backgroundColor: 'rgba(79,123,255,0.7)',
            borderColor: '#4f7bff',
            borderWidth: 1, borderRadius: 6,
        }]
    };

    const pieData = {
        labels: ['Male', 'Female'],
        datasets: [{
            data: [male, female],
            backgroundColor: ['rgba(79,123,255,0.8)', 'rgba(139,92,246,0.8)'],
            borderColor: ['#4f7bff', '#8b5cf6'],
            borderWidth: 2,
        }]
    };

    return (
        <div>
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>System overview and NIC validation statistics</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-4 mb-4" style={{ marginBottom: '28px' }}>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(79,123,255,0.15)' }}>
                        <Users size={24} color="var(--accent-blue-light)" />
                    </div>
                    <div>
                        <div className="stat-value" style={{ color: 'var(--accent-blue-light)' }}>{total.toLocaleString()}</div>
                        <div className="stat-label">Total Records</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
                        <UserCheck size={24} color="var(--accent-green)" />
                    </div>
                    <div>
                        <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{valid.toLocaleString()}</div>
                        <div className="stat-label">Valid NICs</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(79,123,255,0.15)' }}>
                        <TrendingUp size={24} color="var(--accent-blue)" />
                    </div>
                    <div>
                        <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{male.toLocaleString()}</div>
                        <div className="stat-label">Male</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.15)' }}>
                        <UserX size={24} color="var(--accent-purple)" />
                    </div>
                    <div>
                        <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>{female.toLocaleString()}</div>
                        <div className="stat-label">Female</div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-2" style={{ gap: '24px', marginBottom: '28px' }}>
                <div className="card">
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
                        Records per File
                    </h3>
                    {byFile.length > 0 ? (
                        <Bar data={barData} options={chartOptions} />
                    ) : (
                        <div className="text-center text-muted" style={{ padding: '40px 0' }}>No file data yet. Upload CSV files to see stats.</div>
                    )}
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>Gender Distribution</h3>
                    {(male + female) > 0 ? (
                        <div style={{ maxWidth: 260, margin: '0 auto' }}>
                            <Pie data={pieData} options={{ ...chartOptions, scales: undefined }} />
                        </div>
                    ) : (
                        <div className="text-center text-muted" style={{ padding: '40px 0' }}>No gender data yet.</div>
                    )}
                </div>
            </div>

            {/* Recent Files */}
            <div className="card">
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} color="var(--accent-blue)" /> Uploaded Files
                    </span>
                </h3>
                {files.length > 0 ? (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>File Name</th>
                                    <th>Records</th>
                                    <th>Valid</th>
                                    <th>Invalid</th>
                                    <th>Status</th>
                                    <th>Uploaded</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map(f => (
                                    <tr key={f.id}>
                                        <td><span style={{ color: 'var(--accent-blue-light)', fontWeight: 500 }}>{f.originalName}</span></td>
                                        <td>{f.recordCount}</td>
                                        <td><span className="badge badge-success">{f.validCount}</span></td>
                                        <td><span className="badge badge-danger">{f.invalidCount}</span></td>
                                        <td><span className={`badge ${f.status === 'COMPLETED' ? 'badge-success' : 'badge-amber'}`}>{f.status}</span></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{new Date(f.uploadedAt).toLocaleString()}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button 
                                                    onClick={() => handleEditFile(f.id, f.originalName)}
                                                    className="btn-icon" 
                                                    title="Edit Name"
                                                    style={{ color: 'var(--accent-blue-light)', background: 'rgba(79,123,255,0.1)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteFile(f.id, f.originalName)}
                                                    className="btn-icon" 
                                                    title="Delete File"
                                                    style={{ color: 'var(--accent-red)', background: 'rgba(239,68,68,0.1)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center text-muted" style={{ padding: '40px 0' }}>
                        No files uploaded yet. Go to Upload page to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
