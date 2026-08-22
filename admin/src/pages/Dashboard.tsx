import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await api.getDashboard();
      setStats(data);
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>Dashboard</h2>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <span className="stat-label">👥 Toplam Kullanıcı</span>
          <span className="stat-value">{stats?.totalUsers.toLocaleString() || '...'}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">🟢 Günlük Aktif</span>
          <span className="stat-value">{stats?.dailyActive.toLocaleString() || '...'}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">❓ Toplam Soru</span>
          <span className="stat-value">{stats?.totalQuestions.toLocaleString() || '...'}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-label">🎮 Bugün Oynanan</span>
          <span className="stat-value">{stats?.playedToday.toLocaleString() || '...'}</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h3 className="mb-4">Son 7 Günlük Doğruluk Oranı</h3>
          <div className="bar-chart">
            {[45, 52, 48, 60, 55, 62, 58].map((val, idx) => (
              <div className="bar-col" key={idx}>
                <div className="bar" style={{ height: `${val}%` }}></div>
                <span className="bar-label">%{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4">Dil Bazlı Kullanıcı Dağılımı</h3>
          <div className="table-container">
            <table>
              <tbody>
                <tr><td>🇹🇷 Türkçe</td><td>%45</td></tr>
                <tr><td>🇬🇧 İngilizce</td><td>%25</td></tr>
                <tr><td>🇩🇪 Almanca</td><td>%15</td></tr>
                <tr><td>🇪🇸 İspanyolca</td><td>%10</td></tr>
                <tr><td>Diğer</td><td>%5</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <h3 className="mb-4">En Çok Hata Yapılan 5 Soru</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Soru ID</th>
                <th>Soru Tipi</th>
                <th>Zorluk</th>
                <th>Hata Oranı</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>q104</td><td>Çoktan Seçmeli</td><td><span className="badge badge-danger">Zor</span></td><td>%82</td></tr>
              <tr><td>q023</td><td>Doğru/Yanlış</td><td><span className="badge badge-warning">Orta</span></td><td>%76</td></tr>
              <tr><td>q199</td><td>Sıralama</td><td><span className="badge badge-danger">Zor</span></td><td>%71</td></tr>
              <tr><td>q005</td><td>Çoktan Seçmeli</td><td><span className="badge badge-success">Kolay</span></td><td>%65</td></tr>
              <tr><td>q088</td><td>Eşleştirme</td><td><span className="badge badge-warning">Orta</span></td><td>%60</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
