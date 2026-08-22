import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { AdminLog } from '../types';

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const data = await api.getLogs();
      setLogs(data);
    };
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    if (action === 'CREATE') return <span className="badge badge-success">EKLENDİ</span>;
    if (action === 'UPDATE') return <span className="badge badge-warning">GÜNCELLENDİ</span>;
    if (action === 'DELETE') return <span className="badge badge-danger">SİLİNDİ</span>;
    return <span className="badge badge-secondary">{action}</span>;
  };

  return (
    <div className="logs-page">
      <div className="page-header">
        <h2>İşlem Logları</h2>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Yetkili</th>
                <th>İşlem</th>
                <th>Hedef</th>
                <th>Detay</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ color: 'var(--text-secondary)' }}>{log.date}</td>
                  <td>{log.admin}</td>
                  <td>{getActionBadge(log.action)}</td>
                  <td>{log.target}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Logs;
