import React, { useState, useEffect } from 'react';

interface LanguageContent {
  text: string;
  explanation: string;
  wrongMessage: string;
  options: string[];
  correctIndex: number;
  status: 'active' | 'draft' | 'missing';
}

interface QuestionFormProps {
  questionToEdit?: any;
  onSave?: () => void;
  onCancel?: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ questionToEdit, onSave, onCancel }) => {
  const [activeLang, setActiveLang] = useState('tr');
  const [isAiAdapting, setIsAiAdapting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form Temel Bilgileri
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [categoryId, setCategoryId] = useState('1');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [status, setStatus] = useState<'active' | 'passive'>('active');
  const [priority, setPriority] = useState<number>(10);

  // Çeviri Verileri
  const [langData, setLangData] = useState<Record<string, LanguageContent>>({
    tr: { text: '', explanation: '', wrongMessage: '', options: ['', '', '', ''], correctIndex: 0, status: 'active' },
    en: { text: '', explanation: '', wrongMessage: '', options: ['', '', '', ''], correctIndex: 0, status: 'missing' },
    de: { text: '', explanation: '', wrongMessage: '', options: ['', '', '', ''], correctIndex: 0, status: 'missing' },
    fr: { text: '', explanation: '', wrongMessage: '', options: ['', '', '', ''], correctIndex: 0, status: 'missing' },
    es: { text: '', explanation: '', wrongMessage: '', options: ['', '', '', ''], correctIndex: 0, status: 'missing' },
    zh: { text: '', explanation: '', wrongMessage: '', options: ['', '', '', ''], correctIndex: 0, status: 'missing' },
    ru: { text: '', explanation: '', wrongMessage: '', options: ['', '', '', ''], correctIndex: 0, status: 'missing' },
    ar: { text: '', explanation: '', wrongMessage: '', options: ['', '', '', ''], correctIndex: 0, status: 'missing' },
  });

  const languages = [
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' }
  ];

  // Düzenleme verisini forma yükleme
  useEffect(() => {
    if (questionToEdit) {
      setQuestionType(questionToEdit.type || 'multiple_choice');
      setCategoryId(String(questionToEdit.categoryId || '1'));
      setDifficulty(questionToEdit.difficulty || 'medium');
      setStatus(questionToEdit.status === 'active' ? 'active' : 'passive');
      setPriority(questionToEdit.priority || 10);

      // Çevirileri yükle
      const newLangData: Record<string, LanguageContent> = { ...langData };
      const defaultOpts = questionToEdit.options || questionToEdit.opts || ['Seçenek 1', 'Seçenek 2', 'Seçenek 3', 'Seçenek 4'];
      const defaultCorrect = questionToEdit.correctIndex ?? questionToEdit.correct ?? 0;

      languages.forEach(l => {
        const trans = questionToEdit.translations?.[l.code];
        const rawOpts = (trans?.options && trans.options.length) ? trans.options : (l.code === 'tr' ? defaultOpts : ['', '', '', '']);
        const parsedOpts = rawOpts.map((o: any) => typeof o === 'string' ? o : (o?.text || o?.option_text || ''));

        newLangData[l.code] = {
          text: trans?.text || (l.code === 'tr' ? (questionToEdit.title_tr || questionToEdit.text || '') : ''),
          explanation: trans?.explanation || (l.code === 'tr' ? (questionToEdit.explanation || '') : ''),
          wrongMessage: trans?.wrongMessage || (l.code === 'tr' ? (questionToEdit.wrongMessage || '') : ''),
          options: parsedOpts.length >= 4 ? parsedOpts.slice(0, 4) : [...parsedOpts, '', '', ''].slice(0, 4),
          correctIndex: trans?.correctIndex ?? (l.code === 'tr' ? defaultCorrect : 0),
          status: trans?.status || (l.code === 'tr' ? 'active' : 'missing')
        };
      });

      setLangData(newLangData);
    }
  }, [questionToEdit]);

  const currentLangContent = langData[activeLang] || {
    text: '', explanation: '', wrongMessage: '', options: ['', '', '', ''], correctIndex: 0, status: 'missing'
  };

  const updateCurrentLang = (field: keyof LanguageContent, value: any) => {
    setLangData(prev => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        [field]: value,
        status: field === 'text' && value.trim() ? 'active' : prev[activeLang]?.status || 'draft'
      }
    }));
  };

  const updateOptionText = (idx: number, text: string) => {
    const newOpts = [...currentLangContent.options];
    newOpts[idx] = text;
    updateCurrentLang('options', newOpts);
  };

  const handleAiAdapt = () => {
    if (!langData.tr.text.trim()) {
      alert('Önce Türkçe soru metnini giriniz.');
      return;
    }
    setIsAiAdapting(true);
    setTimeout(() => {
      setIsAiAdapting(false);
      setLangData(prev => ({
        ...prev,
        [activeLang]: {
          text: `[${activeLang.toUpperCase()}] ${prev.tr.text}`,
          explanation: `[${activeLang.toUpperCase()}] ${prev.tr.explanation || 'Kültürel olarak uyarlanmış açıklama.'}`,
          wrongMessage: `[${activeLang.toUpperCase()}] ${prev.tr.wrongMessage || 'Yanlış cevap!'}`,
          options: prev.tr.options.map((opt, i) => opt ? `[${activeLang.toUpperCase()}] ${opt}` : `Option ${i+1}`),
          correctIndex: prev.tr.correctIndex,
          status: 'active'
        }
      }));
    }, 1500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onSave) onSave();
    }, 1200);
  };

  return (
    <div className="question-form-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>{questionToEdit ? `✏️ Soru Düzenle (#${questionToEdit.id})` : '➕ Yeni Soru Ekle'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
            Soru metnini, seçenekleri ve çok dilli kültürel uyarlamaları düzenleyin.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>İptal</button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            💾 {questionToEdit ? 'Değişiklikleri Kaydet' : 'Soruyu Kaydet'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="card" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981', color: '#10B981', padding: '12px 18px', marginBottom: '16px' }}>
          ✅ Soru ve dil çevirileri başarıyla kaydedildi!
        </div>
      )}

      <form onSubmit={handleSave} className="grid-form" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        {/* Sol Kolon: Temel Bilgiler */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            ⚙️ Temel Bilgiler
          </h3>
          
          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>Ait Olduğu Seviye (Level 1 - 100)</label>
            <input
              type="number"
              className="input"
              min={1}
              max={100}
              value={priority || 1}
              onChange={e => setPriority(Number(e.target.value))}
              placeholder="Örn: 1"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>Yayın Durumu</label>
            <select className="input" value={status} onChange={e => setStatus(e.target.value as any)}>
              <option value="active">🟢 Aktif (Yayında)</option>
              <option value="passive">🔴 Pasif (Gizli)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>Öncelik Sırası (1-100)</label>
            <input type="number" className="input" value={priority} onChange={e => setPriority(Number(e.target.value))} />
          </div>
        </div>

        {/* Sağ Kolon: Dil Tabları ve İçerik */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div className="tabs" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {languages.map(lang => {
                const isReady = langData[lang.code]?.text?.trim() !== '';
                return (
                  <button 
                    key={lang.code}
                    type="button"
                    className={`tab ${activeLang === lang.code ? 'active' : ''}`}
                    onClick={() => setActiveLang(lang.code)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: activeLang === lang.code ? 'var(--accent-gradient, #7C3AED)' : 'transparent',
                      color: activeLang === lang.code ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    {lang.flag} {lang.code.toUpperCase()} {isReady ? '✅' : '⏳'}
                  </button>
                );
              })}
            </div>
            {activeLang !== 'tr' && (
              <button 
                type="button"
                className="btn btn-secondary" 
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={handleAiAdapt}
                disabled={isAiAdapting}
              >
                {isAiAdapting ? '⏳ AI Uyarlıyor...' : '✨ AI ile Uyarla'}
              </button>
            )}
          </div>

          {isAiAdapting ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#7C3AED' }}>
              🤖 Türkçe soru içeriği <strong>{languages.find(l => l.code === activeLang)?.label}</strong> diline kültürel olarak uyarlanıyor...
            </div>
          ) : (
            <div className="lang-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px' }}>
                  Soru Metni ({languages.find(l => l.code === activeLang)?.label})
                </label>
                <textarea 
                  className="input" 
                  rows={3} 
                  value={currentLangContent.text}
                  placeholder="Soruyu buraya yazın..."
                  onChange={e => updateCurrentLang('text', e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '13px' }}>
                  Cevap Seçenekleri (Doğru seçeneğin yanındaki radyo butonunu işaretleyin)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[0, 1, 2, 3].map(idx => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input 
                        type="radio" 
                        name={`correct_opt_${activeLang}`} 
                        checked={currentLangContent.correctIndex === idx}
                        onChange={() => updateCurrentLang('correctIndex', idx)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        title="Doğru cevap olarak işaretle"
                      />
                      <input 
                        type="text" 
                        className="input" 
                        placeholder={`Seçenek ${idx + 1}`}
                        value={currentLangContent.options[idx] || ''}
                        onChange={e => updateOptionText(idx, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px' }}>
                  Açıklama Metni (Doğru cevaplandığında veya oyun sonunda gösterilir)
                </label>
                <textarea 
                  className="input" 
                  rows={2} 
                  value={currentLangContent.explanation}
                  placeholder="Örn: Kelime Kırmızı yazıyor ama mavi renkle boyanmıştır."
                  onChange={e => updateCurrentLang('explanation', e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '13px' }}>
                  Yanlış Cevap Mesajı (Mizahi / Eğlenceli)
                </label>
                <input 
                  type="text" 
                  className="input" 
                  value={currentLangContent.wrongMessage}
                  placeholder="Örn: Tuzağa düştün! Bir daha düşün."
                  onChange={e => updateCurrentLang('wrongMessage', e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
