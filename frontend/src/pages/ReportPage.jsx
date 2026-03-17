import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FileDown, FileText, Table, Sheet } from 'lucide-react';

const formats = [
    {
        id: 'pdf',
        label: 'PDF Report',
        description: 'Professional formatted document with MobiOs branding',
        icon: '📄',
        mime: 'application/pdf',
        ext: 'pdf',
        color: 'var(--accent-red)',
        bg: 'rgba(239,68,68,0.08)',
        border: 'rgba(239,68,68,0.2)',
    },
    {
        id: 'csv',
        label: 'CSV Export',
        description: 'Comma-separated values, compatible with any spreadsheet',
        icon: '📊',
        mime: 'text/csv',
        ext: 'csv',
        color: 'var(--accent-green)',
        bg: 'rgba(16,185,129,0.08)',
        border: 'rgba(16,185,129,0.2)',
    },
    {
        id: 'excel',
        label: 'Excel Export',
        description: 'Microsoft Excel format with styled header row',
        icon: '📋',
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ext: 'xlsx',
        color: 'var(--accent-cyan)',
        bg: 'rgba(6,182,212,0.08)',
        border: 'rgba(6,182,212,0.2)',
    },
];

export default function ReportPage() {
    const [gender, setGender] = useState('');
    const [fileName, setFileName] = useState('');
    const [downloading, setDownloading] = useState('');
    const [previewStats, setPreviewStats] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);

    const loadPreview = async () => {
        setLoadingPreview(true);
        try {
            const params = {};
            if (gender) params.gender = gender;
            if (fileName) params.fileName = fileName;
            const res = await axios.get('/api/nic/records', { params });
            const data = res.data || [];
            setPreviewStats({
                total: data.length,
                male: data.filter(r => r.gender === 'Male').length,
                female: data.filter(r => r.gender === 'Female').length,
                valid: data.filter(r => r.isValid).length,
            });
        } catch {
            toast.error('Failed to load preview');
        } finally {
            setLoadingPreview(false);
        }
    };

    const downloadReport = async (format) => {
        setDownloading(format.id);
        try {
            const params = { format: format.id };
            if (gender) params.gender = gender;
            if (fileName) params.fileName = fileName;

            const res = await axios.get('/api/reports/export', {
                params,
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([res.data], { type: format.mime }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `nic_report_${new Date().toISOString().split('T')[0]}.${format.ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success(`${format.label} downloaded successfully!`);
        } catch (err) {
            toast.error('Failed to generate report. Make sure all services are running.');
        } finally {
            setDownloading('');
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1>Reports</h1>
                <p>Export NIC validation data in PDF, CSV or Excel format</p>
            </div>

            {/* Filter Panel */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Filter Options</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Gender</label>
                        <select className="form-input filter-select" value={gender} onChange={e => setGender(e.target.value)} style={{ paddingTop: '11px', paddingBottom: '11px' }}>
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">File Name</label>
                        <input
                            className="form-input"
                            placeholder="Enter file name (optional)"
                            value={fileName}
                            onChange={e => setFileName(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button className="btn btn-secondary" onClick={loadPreview} disabled={loadingPreview}>
                        {loadingPreview ? <><span className="spinner" /> Loading...</> : '🔍 Preview Count'}
                    </button>
                    {previewStats && (
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                            <span><strong style={{ color: 'var(--text-primary)' }}>{previewStats.total}</strong> <span style={{ color: 'var(--text-secondary)' }}>total</span></span>
                            <span><strong style={{ color: 'var(--accent-blue)' }}>{previewStats.male}</strong> <span style={{ color: 'var(--text-secondary)' }}>male</span></span>
                            <span><strong style={{ color: 'var(--accent-purple)' }}>{previewStats.female}</strong> <span style={{ color: 'var(--text-secondary)' }}>female</span></span>
                            <span><strong style={{ color: 'var(--accent-green)' }}>{previewStats.valid}</strong> <span style={{ color: 'var(--text-secondary)' }}>valid</span></span>
                        </div>
                    )}
                </div>
            </div>

            {/* Export Cards */}
            <div className="grid grid-3" style={{ gap: '20px' }}>
                {formats.map(fmt => (
                    <div key={fmt.id} className="card" style={{ border: `1px solid ${fmt.border}`, background: fmt.bg }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>{fmt.icon}</div>
                        <h3 style={{ fontWeight: 700, fontSize: '17px', color: fmt.color, marginBottom: '8px' }}>{fmt.label}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
                            {fmt.description}
                        </p>
                        <button
                            className="btn"
                            onClick={() => downloadReport(fmt)}
                            disabled={!!downloading}
                            style={{
                                width: '100%', justifyContent: 'center',
                                background: fmt.bg, color: fmt.color,
                                border: `1px solid ${fmt.border}`,
                                padding: '12px',
                            }}
                        >
                            {downloading === fmt.id ? (
                                <><span className="spinner" /> Generating...</>
                            ) : (
                                <><FileDown size={16} /> Download {fmt.label}</>
                            )}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
