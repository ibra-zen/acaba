import React, { useEffect, useState } from 'react';
import { api } from '../api';

interface QuestionItem {
  id: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  categoryId: string;
  status: 'active' | 'draft' | 'archive';
  priority: number;
  title_tr?: string;
  translations: Record<string, { status: string; text?: string }>;
}

interface QuestionsProps {
  onEditQuestion?: (q: QuestionItem) => void;
  onAddNew?: () => void;
}

const Questions: React.FC<QuestionsProps> = ({ onEditQuestion, onAddNew }) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const data = await api.getQuestions();
    setQuestions(data);
    setLoading(false);
  };

  const getLangIcon = (lang: string) => {
    const icons: Record<string, string> = { tr: '🇹🇷', en: '🇺🇸', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸', zh: '🇨🇳', ru: '🇷🇺' };
    return icons[lang] || lang;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'active' || status === 'ready') return '✅';
    if (status === 'draft') return '⏳';
    return '❌';
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      attention: '👀 Dikkat',
      reverse_logic: '🔄 Ters Mantık',
      memory: '🧠 Hafıza',
      reflex: '⚡ Refleks',
      patience: '🕐 Sabır',
      multiple_choice: '📚 Çoktan Seçmeli',
      drag_drop: '🖐️ Sürükle Bırak',
      long_press: '⏱️ Basılı Tut'
    };
    return map[type] || type;
  };

  const getDifficultyBadge = (diff: string) => {
    if (diff === 'hard') return <span className="badge badge-danger">Zor</span>;
    if (diff === 'medium') return <span className="badge badge-warning">Orta</span>;
    return <span className="badge badge-success">Kolay</span>;
  };

  const filteredQuestions = questions.filter(q => {
    const title = q.title_tr || q.translations.tr?.text || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || q.id.includes(searchTerm);
    const matchesDiff = difficultyFilter === '' || q.difficulty === difficultyFilter;
    const matchesType = typeFilter === '' || q.type === typeFilter;
    return matchesSearch && matchesDiff && matchesType;
  });

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`"#${id}: ${title}" sorusunu silmek istediğinize emin misiniz?`)) {
      await api.deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  return (
    <div className="questions-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>❓ Soru Bankası ({questions.length} Soru)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Oyun içindeki tüm demo ve aktif soruları yönetin, çok dilli çevirilerini inceleyin.
          </p>
        </div>
        <button className="btn btn-primary" onClick={onAddNew}>
          ➕ Yeni Soru Ekle
        </button>
      </div>

      {/* Arama Çubuğu */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '15px', fontWeight: 700 }}>100 Level Kademeli Soru Listesi</div>
        <input 
          type="text" 
          className="input" 
          placeholder="🔍 Soru metni veya Level ara (Örn: Level 45)..." 
          style={{ width: '360px' }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Soru Tablosu */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            ⏳ Sorular yükleniyor...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Soru Metni (TR)</th>
                  <th style={{ width: '130px' }}>Seviye</th>
                  <th style={{ width: '90px' }}>Durum</th>
                  <th style={{ width: '200px' }}>Dil Kapsama Matrisi</th>
                  <th style={{ width: '150px' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>
                      Aranan kriterlere uygun soru bulunamadı.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map(q => {
                    const titleText = q.title_tr || q.translations.tr?.text || '—';
                    const levelNum = Math.ceil(Number(q.id) / 10) || q.priority || 1;
                    return (
                      <tr key={q.id}>
                        <td><strong>#{q.id}</strong></td>
                        <td style={{ fontWeight: 600 }}>{titleText}</td>
                        <td>
                          <span className="badge badge-info">Level {levelNum}</span>
                        </td>
                        <td>
                          <span className={`badge ${q.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                            {q.status === 'active' ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', fontSize: '13px' }}>
                            {['tr', 'en', 'de', 'fr', 'es', 'zh', 'ru'].map(lang => {
                              const st = q.translations[lang]?.status || 'missing';
                              return (
                                <span key={lang} title={`${lang.toUpperCase()}: ${st}`}>
                                  {getLangIcon(lang)}{getStatusIcon(st)}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                              onClick={() => onEditQuestion && onEditQuestion(q)}
                            >
                              ✏️ Düzenle
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '4px 10px', fontSize: '12px' }}
                              onClick={() => handleDelete(q.id, titleText)}
                            >
                              🗑️ Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;
