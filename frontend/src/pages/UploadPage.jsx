import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Upload, X, FileText, CheckCircle, XCircle, AlertTriangle,
    FileUp, Files, Trash2, Check, ExternalLink, RefreshCw
} from 'lucide-react';

export default function UploadPage() {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);
    const [resultFilter, setResultFilter] = useState('all'); // 'all', 'valid', 'invalid'

    const onDrop = useCallback((accepted) => {
        const csvFiles = accepted.filter(f => f.name.toLowerCase().endsWith('.csv') || f.type === 'text/csv');
        if (csvFiles.length === 0) { toast.error('Please upload CSV files only'); return; }
        const total = [...files, ...csvFiles];
        setFiles(total);
    }, [files]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'], 'application/vnd.ms-excel': ['.csv'] },
        disabled: uploading,
    });

    const removeFile = (idx) => setFiles(p => p.filter((_, i) => i !== idx));

    const handleUpload = async () => {
        if (files.length < 1) {
            toast.error(`Please select at least 1 CSV file. Currently selected: ${files.length}`);
            return;
        }
        setUploading(true);
        setProgress(0);
        setResults(null);

        const formData = new FormData();
        files.forEach(f => formData.append('files', f));

        try {
            const res = await axios.post('/api/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    setProgress(Math.round((e.loaded * 90) / e.total));
                },
            });
            setProgress(100);
            setResults(res.data.results);
            toast.success('All files processed successfully!');
            setFiles([]);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed. Check that all services are running.');
        } finally {
            setUploading(false);
        }
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="page-header" style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h1 style={{ fontSize: '42px', letterSpacing: '-1px' }}>Verify NIC Numbers</h1>
                <p style={{ fontSize: '18px', maxWidth: '600px', margin: '12px auto' }}>
                    Upload CSV files for high-speed, parallel validation and processing.
                </p>
            </div>

            <div className="card" style={{
                border: 'none',
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(20px)',
                padding: '40px'
            }}>
                {/* Requirement banner */}
                <div style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '32px',
                    background: 'rgba(79, 123, 255, 0.08)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'var(--accent-blue)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <Files size={18} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>Batch Processing Requirements</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Upload CSV files simultaneously. Ensure each file contains a <code>nic</code> column.
                        </div>
                    </div>
                </div>

                {/* Dropzone */}
                <div {...getRootProps()} className={`dropzone${isDragActive ? ' active' : ''}`} style={{
                    border: '2px dashed var(--border-color)',
                    padding: '60px 40px',
                    background: isDragActive ? 'var(--accent-blue-glow)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <input {...getInputProps()} />
                    <div className="dropzone-icon" style={{
                        fontSize: '64px',
                        marginBottom: '24px',
                        filter: 'drop-shadow(0 0 20px rgba(79, 123, 255, 0.3))'
                    }}>
                        {isDragActive ? '✨' : '☁️'}
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
                        {isDragActive ? 'Drop them right here!' : 'Drop CSV files or Click to Browse'}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Multiple files supported · Max 10MB per file
                    </p>

                    {/* Animated background element */}
                    <div style={{
                        position: 'absolute',
                        top: '-10%',
                        right: '-5%',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, var(--accent-blue-glow) 0%, transparent 70%)',
                        zIndex: -1,
                        opacity: 0.5
                    }} />
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div style={{ marginTop: '40px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: '20px',
                            padding: '0 4px'
                        }}>
                            <h4 style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                Selected Files <span className="badge badge-blue">{files.length}</span>
                            </h4>
                            <span style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={14} /> System Ready
                            </span>
                        </div>
                        <div className="grid grid-2" style={{ gap: '12px' }}>
                            {files.map((f, i) => (
                                <div key={i} className="file-item" style={{
                                    padding: '16px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255,255,255,0.01)',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: 'rgba(79, 123, 255, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        <FileText size={20} color="var(--accent-blue)" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="file-item-name" style={{ fontWeight: 600, fontSize: '14px' }}>{f.name}</div>
                                        <div className="file-item-size" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{formatSize(f.size)}</div>
                                    </div>
                                    <button
                                        className="file-remove"
                                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                        disabled={uploading}
                                        style={{
                                            width: '32px', height: '32px', borderRadius: '8px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'rgba(239, 68, 68, 0.05)',
                                            color: 'var(--accent-red)'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Progress */}
                {uploading && (
                    <div style={{ marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                            <span>Processing files...</span>
                            <span style={{ color: 'var(--accent-blue)' }}>{progress}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                    <button
                        className="btn btn-primary"
                        onClick={handleUpload}
                        disabled={uploading || files.length < 1}
                        style={{
                            height: '52px',
                            padding: '0 32px',
                            fontSize: '16px',
                            flex: 1,
                            justifyContent: 'center'
                        }}
                    >
                        {uploading ? (
                            <><span className="spinner" style={{ marginRight: '12px' }} /> Initializing Parallel Engines...</>
                        ) : (
                            <><FileUp size={20} /> Start Batch Validation</>
                        )}
                    </button>
                    {files.length > 0 && !uploading && (
                        <button className="btn btn-secondary" onClick={() => setFiles([])} style={{ height: '52px', padding: '0 24px' }}>
                            <RefreshCw size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Results Title */}
            {results && (
                <div style={{ margin: '64px 0 32px 0', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Validation Results</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Detailed report for your batch upload</p>

                    <div style={{ marginTop: '24px' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                let query = '';
                                if (resultFilter === 'valid') query = '?valid=true';
                                else if (resultFilter === 'invalid') query = '?valid=false';
                                navigate('/records' + query);
                            }}
                            style={{ padding: '12px 24px', borderRadius: '12px' }}
                        >
                            <ExternalLink size={18} style={{ marginRight: '8px' }} />
                            View Records in Detail
                        </button>
                    </div>
                </div>
            )}

            {results && results.map((r, i) => (
                <div key={i} className="card" style={{
                    marginBottom: '32px',
                    padding: '0',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)'
                }}>
                    <div style={{
                        padding: '24px',
                        background: 'rgba(79, 123, 255, 0.05)',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <FileText size={24} color="var(--accent-blue)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text-primary)' }}>{r.fileName}</div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                    Batch Entry #{i + 1} • {r.recordCount} Total Records
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button 
                                className={`btn ${resultFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setResultFilter('all')}
                                style={{ padding: '4px 12px', fontSize: '11px', height: '28px' }}
                            >
                                All ({r.recordCount})
                            </button>
                            <button 
                                className={`btn ${resultFilter === 'valid' ? 'btn-success' : 'btn-secondary'}`}
                                onClick={() => setResultFilter('valid')}
                                style={{ padding: '4px 12px', fontSize: '11px', height: '28px', background: resultFilter === 'valid' ? 'var(--accent-green)' : '' }}
                            >
                                Valid ({r.validCount})
                            </button>
                            <button 
                                className={`btn ${resultFilter === 'invalid' ? 'btn-danger' : 'btn-secondary'}`}
                                onClick={() => setResultFilter('invalid')}
                                style={{ padding: '4px 12px', fontSize: '11px', height: '28px', background: resultFilter === 'invalid' ? 'var(--accent-red)' : '' }}
                            >
                                Invalid ({r.invalidCount})
                            </button>
                        </div>
                    </div>

                    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-secondary)' }}>
                                <tr>
                                    <th style={{ padding: '16px' }}>NIC Number</th>
                                    <th style={{ padding: '16px' }}>Birthday</th>
                                    <th style={{ padding: '16px' }}>Details</th>
                                    <th style={{ padding: '16px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(r.records || [])
                                    .filter(rec => {
                                        if (resultFilter === 'valid') return rec.isValid;
                                        if (resultFilter === 'invalid') return !rec.isValid;
                                        return true;
                                    })
                                    .slice(0, 50).map((rec, j) => (
                                    <tr key={j} style={{ transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px', fontFamily: '"Outfit", monospace', fontWeight: 600, letterSpacing: '0.5px' }}>
                                            {rec.nicNumber}
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                                            {rec.birthday || '—'}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                {rec.age && <span className="badge badge-blue" style={{ textTransform: 'none' }}>{rec.age}y</span>}
                                                {rec.gender && <span className={`badge ${rec.gender === 'Male' ? 'badge-cyan' : 'badge-purple'}`} style={{ textTransform: 'none' }}>{rec.gender}</span>}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {rec.isValid ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontWeight: 600, fontSize: '13px' }}>
                                                    <CheckCircle size={14} /> Valid
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-red)', fontWeight: 600, fontSize: '13px' }} title={rec.errorMessage}>
                                                    <XCircle size={14} /> Invalid
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {(r.records || []).length > 50 && (
                        <div style={{
                            padding: '16px',
                            textAlign: 'center',
                            background: 'rgba(255,255,255,0.02)',
                            color: 'var(--text-secondary)',
                            fontSize: '13px',
                            borderTop: '1px solid var(--border-color)'
                        }}>
                            Showing first 50 records. See full report in <strong>Records</strong> page.
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
