import React, { useEffect, useState } from 'react';
import { api } from '../api';

interface FeedbackItem {
  id: string;
  questionId: string;
  questionTitle?: string;
  user: string;
  type: 'up' | 'down' | 'report';
  reason?: string;
  comment: string;
  date: string;
  status: 'pending' | 'resolved';
}

interface FeedbackProps {
  onEditQuestion?: (q: any) => void;
}

const Feedback: React.FC<FeedbackProps> = ({ onEditQuestion }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setLoading(true);
    const data = await api.getFeedback();
    setFeedbacks(data);
    setLoading(false);
  };

  const handleResolve = (id: string) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: 'resolved' } : f));
  };

  const handleFixQuestion = async (qId: string) => {
    const questions = await api.getQuestions();
    const targetQ = questions.find((q: any) => String(q.id) === String(qId)) || {
      id: qId,
      title_tr: `Soru #${qId}`,
      type: 'multiple_choice',
      difficulty: 'medium',
      categoryId: '1',
      status: 'active'
    };
    if (onEditQuestion) {
      onEditQuestion(targetQ);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (filterType === 'report') return f.type === 'report';
    if (filterType === 'likes') return f.type === 'up';
    return true;
  });

  const reportedCount = feedbacks.filter(f => f.type === 'report' && f.status !== 'resolved').length;

  return (
    <div className="feedback-page">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>🚨 Hatalı Soru & Geri Bildirim İnceleme</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Kullanıcılar tarafından bildirilen hatalı soruları inceleyip doğrudan düzenleyebilirsiniz.
          </p>
        </div>
      </div>

      {/* Özet Kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Bekleyen Hatalı Soru Bildirimi</div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px', color: reportedCount > 0 ? '#EF4444' : '#10B981' }}>
            {reportedCount} Adet
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Toplam Geri Bildirim</div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px', color: 'var(--text-primary)' }}>
            {feedbacks.length}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>Olumlu Beğeni Oranı</div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '6px', color: '#10B981' }}>
            %88
          </div>
        </div>
      </div>

      {/* Filtre Barı */}
      <div className="card" style={{ marginBottom: '20px', padding: '14px 20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: 700 }}>Filtrele:</span>
        <button
          className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterType('all')}
        >
          Tümü ({feedbacks.length})
        </button>
        <button
          className={`btn ${filterType === 'report' ? 'btn-danger' : 'btn-secondary'}`}
          onClick={() => setFilterType('report')}
        >
          🚨 Hatalı Soru Bildirimleri ({feedbacks.filter(f => f.type === 'report').length})
        </button>
        <button
          className={`btn ${filterType === 'likes' ? 'btn-success' : 'btn-secondary'}`}
          onClick={() => setFilterType('likes')}
        >
          👍 Beğeniler ({feedbacks.filter(f => f.type === 'up').length})
        </button>
      </div>

      {/* Geri Bildirimler Tablosu */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            ⏳ Bildirimler yükleniyor...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Soru ID</th>
                  <th>Bildirim Tipi & Neden</th>
                  <th>Kullanıcı</th>
                  <th>Açıklama / Yorum</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                  <th style={{ width: '220px' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      Filtreye uygun bildirim bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredFeedbacks.map(f => (
                    <tr key={f.id} style={{ background: f.status === 'resolved' ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                      <td><strong>#{f.questionId}</strong></td>
                      <td>
                        {f.type === 'report' && (
                          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            🚨 Hatalı Soru {f.reason ? `(${f.reason})` : ''}
                          </span>
                        )}
                        {f.type === 'up' && <span className="badge badge-success">👍 Beğeni</span>}
                        {f.type === 'down' && <span className="badge badge-warning">👎 Şikayet</span>}
                      </td>
                      <td style={{ fontWeight: 700 }}>{f.user}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{f.comment || '—'}</td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{f.date}</td>
                      <td>
                        <span className={`badge ${f.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                          {f.status === 'resolved' ? '✅ Çözüldü' : '⏳ İnceleme Bekliyor'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => handleFixQuestion(f.questionId)}
                            title="Soruyu Düzenleme Ekranında Aç"
                          >
                            ✏️ Düzenle & Düzelt
                          </button>
                          {f.status !== 'resolved' && (
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                              onClick={() => handleResolve(f.id)}
                            >
                              ✅ Tamam
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
