import React, { useEffect, useState } from 'react';
import { api } from '../api';

interface QuestionItem {
  id: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
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
    const icons: Record<string, string> = { tr: '🇹🇷', en: '🇺🇸', ar: '🇸🇦', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸', zh: '🇨🇳', ru: '🇷🇺' };
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
      localStorage.setItem('bsm_custom_questions_overridden', 'true');
      const filtered = questions.filter(q => q.id !== id);
      localStorage.setItem('bsm_custom_questions', JSON.stringify(filtered));
      setQuestions(filtered);
    }
  };

  const [showAiModal, setShowAiModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [jsonInputText, setJsonInputText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  const aiPromptText = `Sen profesyonel bir Mobil Zeka Oyunu Soru Tasarımcısısın. "Acaba Salak mıyım?" isimli eğlenceli, dikkat tuzaklı, kafa karıştıran ve komik zeka oyunu için 1000 ADET TAMAMEN ÖZGÜN, TEKRARSIZ VE BİRBİRİNDEN FARKLI soru üret.

ÖNEMLİ KURALLAR VE ŞARTLAR:
1. Kesinlikle matematik işlemi veya saat açısı gibi monoton formül tekrarları İÇERMEMELİDİR.
2. Görsel illüzyonlar, dikkat tuzakları, atasözü & deyim şaşırtmacaları, komik mantık paradoksları ve güncel hayat bilmeceleri kullanılmalıdır.
3. Her bir soru 8 DİLDE (tr: Türkçe, en: İngilizce, ar: Arapça, de: Almanca, fr: Fransızca, es: İspanyolca, zh: Çince, ru: Rusça) tam çevirisi ve seçenekleri ile hazırlanmalıdır.
4. Çıktı kesinlikle geçerli bir JSON array formatında olmalıdır (JSON dışında hiçbir açıklama metni yazma):

[
  {
    "priority": 1,
    "type": "attention",
    "difficulty": "medium",
    "translations": {
      "tr": { "text": "KIRMIZI kelimesi MAVİ renkle yazılırsa ne okutulur?", "options": ["Kırmızı", "Mavi", "Yeşil", "Sarı"], "correctIndex": 0, "explanation": "Yazı rengine bakma! Kelime KIRMIZI okutulur." },
      "en": { "text": "If the word RED is written in BLUE ink, what does it read?", "options": ["Red", "Blue", "Green", "Yellow"], "correctIndex": 0, "explanation": "Don't look at ink color! The word reads RED." },
      "ar": { "text": "إذا كُتبت كلمة أحمر باللون الأزرق، فماذا تُقرأ؟", "options": ["أحمر", "أزرق", "أخضر", "أصفر"], "correctIndex": 0, "explanation": "لا تنظر للون! الكلمة تُقرأ أحمر." },
      "de": { "text": "Wenn das Wort ROT in BLAUER Farbe steht, wie wird es gelesen?", "options": ["Rot", "Blau", "Grün", "Gelb"], "correctIndex": 0, "explanation": "Lies das Wort, nicht die Farbe! Es heißt ROT." },
      "fr": { "text": "Si le mot ROUGE est écrit en BLEU, comment se lit-il ?", "options": ["Rouge", "Bleu", "Vert", "Jaune"], "correctIndex": 0, "explanation": "Le mot se lit ROUGE !" },
      "es": { "text": "Si la palabra ROJO se escribe en AZUL, ¿cómo se lee?", "options": ["Rojo", "Azul", "Verde", "Amarillo"], "correctIndex": 0, "explanation": "¡La palabra se lee ROJO!" },
      "zh": { "text": "如果用蓝色书写“红色”这个词，它读作什么？", "options": ["红色", "蓝色", "绿色", "黄色"], "correctIndex": 0, "explanation": "不要看颜色！这个词读作“红色”。" },
      "ru": { "text": "Если слово КРАСНЫЙ написано СИНИМ цветом, как оно читается?", "options": ["Красный", "Синий", "Зеленый", "Желтый"], "correctIndex": 0, "explanation": "Не смотрите на цвет! Слово читается КРАСНЫЙ." }
    }
  }
]`;

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(aiPromptText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleJsonImport = () => {
    try {
      setImportStatus('');
      const parsed = JSON.parse(jsonInputText);
      if (!Array.isArray(parsed)) {
        setImportStatus('❌ Hata: Girdiğiniz veri bir JSON dizisi (Array [...]) olmalıdır.');
        return;
      }

      let addedCount = 0;
      const newItems = parsed.map((item, index) => {
        addedCount++;
        const newId = String(questions.length + index + 1);
        return {
          id: newId,
          type: item.type || 'multiple_choice',
          difficulty: (item.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
          status: (item.status === 'draft' ? 'draft' : 'active') as 'active' | 'draft' | 'archive',
          priority: item.priority || 1,
          title_tr: item.translations?.tr?.text || item.text || `Soru #${newId}`,
          translations: item.translations || {
            tr: { status: 'active', text: item.text || '', options: item.options || [], correctIndex: item.correctIndex || 0 }
          }
        };
      });

      localStorage.setItem('bsm_custom_questions_overridden', 'true');
      const updatedList = [...questions, ...newItems];
      localStorage.setItem('bsm_custom_questions', JSON.stringify(updatedList));
      setQuestions(updatedList);
      setImportStatus(`✅ Başarılı! ${addedCount} adet yeni soru sisteme aktarıldı.`);
      setTimeout(() => {
        setShowImportModal(false);
        setJsonInputText('');
        setImportStatus('');
      }, 1800);
    } catch (e) {
      setImportStatus('❌ Geçersiz JSON formatı! Lütfen verinin doğru kopyalandığından emin olun.');
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("⚠️ TÜM SORULARI SİLMEK İSTEDİĞİNİZE EMİN MİSİNİZ?\n\nBu işlem geri alınamaz ve soru bankasındaki tüm sorular sıfırlanacaktır.")) {
      await api.clearAllQuestions();
      setQuestions([]);
    }
  };

  const handleRestoreDemo = async () => {
    if (window.confirm("🔄 Orjinal 1000 demo soruyu geri yüklemek istediğinize emin misiniz?")) {
      await api.restoreDemoQuestions();
      loadQuestions();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setJsonInputText(event.target?.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `acaba_salak_miyim_sorular_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="questions-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>❓ Soru Bankası ({questions.length} Soru)</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Oyun içindeki tüm özgün soruları yönetin, AI prompt oluşturun veya toplu yükleyin.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-danger" onClick={handleClearAll}>
            🗑️ Tüm Soruları Sil
          </button>
          <button className="btn btn-secondary" style={{ background: '#7C3AED', color: 'white' }} onClick={() => setShowAiModal(true)}>
            🤖 AI Prompt Al
          </button>
          <button className="btn btn-secondary" style={{ background: '#059669', color: 'white' }} onClick={() => setShowImportModal(true)}>
            📥 JSON İçe Aktar
          </button>
          <button className="btn btn-secondary" onClick={exportToJson}>
            📤 JSON Dışa Aktar
          </button>
          <button className="btn btn-primary" onClick={onAddNew}>
            ➕ Yeni Soru Ekle
          </button>
        </div>
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
                            {['tr', 'en', 'ar', 'de', 'fr', 'es', 'zh', 'ru'].map(lang => {
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

      {/* 🤖 AI PROMPT MODALI */}
      {showAiModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '600px', maxWidth: '90%', padding: '24px', background: '#1E293B', color: 'white' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>🤖 Yapay Zeka (ChatGPT / Claude) Soru Üreteci</h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '14px' }}>
              Aşağıdaki prompt'u kopyalayıp ChatGPT veya Claude'a yapıştırın. Yapay zeka size saniyeler içinde 20 adet özgün soru üretecektir. Sonra gelen çıktıyı "JSON İçe Aktar" alanına yapıştırın.
            </p>
            <textarea
              readOnly
              style={{ width: '100%', height: '220px', background: '#0F172A', color: '#38BDF8', padding: '12px', borderRadius: '8px', border: '1px solid #334155', fontFamily: 'monospace', fontSize: '12px', marginBottom: '16px' }}
              value={aiPromptText}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 700 }}>{copySuccess ? '✅ Prompt kopyalandı! Şimdi ChatGPT\'ye yapıştırın.' : ''}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={() => setShowAiModal(false)}>Kapat</button>
                <button className="btn btn-primary" style={{ background: '#7C3AED' }} onClick={copyPromptToClipboard}>📋 Prompt'u Kopyala</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📥 TOPLU JSON İÇE AKTAR MODALI */}
      {showImportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '640px', maxWidth: '90%', padding: '24px', background: '#1E293B', color: 'white' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>📥 Toplu Soru İçe Aktar (JSON / Dosya)</h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '12px' }}>
              ChatGPT'den aldığınız JSON verisini buraya yapıştırın veya `.json` dosyanızı seçin:
            </p>
            <input type="file" accept=".json" onChange={handleFileUpload} style={{ marginBottom: '12px', fontSize: '13px', color: '#CBD5E1' }} />
            <textarea
              placeholder="[{ &quot;type&quot;: &quot;attention&quot;, &quot;translations&quot;: { &quot;tr&quot;: { &quot;text&quot;: &quot;Örnek soru?&quot;, &quot;options&quot;: [&quot;A&quot;, &quot;B&quot;, &quot;C&quot;, &quot;D&quot;], &quot;correctIndex&quot;: 0 } } }]"
              style={{ width: '100%', height: '180px', background: '#0F172A', color: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #334155', fontFamily: 'monospace', fontSize: '12px', marginBottom: '12px' }}
              value={jsonInputText}
              onChange={e => setJsonInputText(e.target.value)}
            />
            {importStatus && <div style={{ fontSize: '13px', marginBottom: '12px', fontWeight: 700 }}>{importStatus}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>İptal</button>
              <button className="btn btn-primary" style={{ background: '#059669' }} onClick={handleJsonImport}>📥 İçe Aktar ve Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
