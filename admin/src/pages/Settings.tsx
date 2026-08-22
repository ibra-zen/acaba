import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    appName: 'Ben Salak mıyım?',
    minAppVersion: '1.0.0',
    maintenanceMode: false,
    dailyQuestionCount: 5,
    defaultLanguage: 'tr',
    adFrequency: '5_questions',
    announcementActive: true,
    announcementText: '🎉 Yeni Günlük Görevler ve Başarım Rozetleri eklendi! Hemen dene.',
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="settings-page">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>⚙️ Sistem & Oyun Ayarları</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Oyun parametrelerini, sürüm kontrollerini ve sistem duyurularını buradan yönetin.
        </p>
      </div>

      {savedMessage && (
        <div className="card" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981', color: '#10B981', padding: '12px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ✅ Ayarlar başarıyla kaydedildi!
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Oyun Kuralları Kartı */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            🎮 Oyun Parametreleri
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Uygulama Adı
              </label>
              <input
                type="text"
                className="input"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Varsayılan Dil
              </label>
              <select
                className="input"
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
              >
                <option value="tr">Türkçe 🇹🇷</option>
                <option value="en">English 🇺🇸</option>
                <option value="de">Deutsch 🇩🇪</option>
                <option value="fr">Français 🇫🇷</option>
                <option value="es">Español 🇪🇸</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Oyun Modu Yapılandırması
              </label>
              <input
                type="text"
                className="input"
                value="Sadece Klasik Mod (10 Soruluk Seviye Testleri)"
                disabled
                style={{ opacity: 0.8 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Seviye Başı Soru Sayısı
              </label>
              <input
                type="number"
                className="input"
                value={settings.dailyQuestionCount}
                onChange={(e) => setSettings({ ...settings, dailyQuestionCount: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {/* Sürüm & Bakım Kartı */}
        <div className="card">
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            🚀 Sürüm & Güvenlik
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Minimum Desteklenen Versiyon (Android)
              </label>
              <input
                type="text"
                className="input"
                value={settings.minAppVersion}
                onChange={(e) => setSettings({ ...settings, minAppVersion: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>🛠️ Bakım Modu</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Açıldığında oyuna erişim engellenir.</div>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Reklam Gösterim Sıklığı
              </label>
              <select
                className="input"
                value={settings.adFrequency}
                onChange={(e) => setSettings({ ...settings, adFrequency: e.target.value })}
              >
                <option value="3_questions">Her 3 soruda bir</option>
                <option value="5_questions">Her 5 soruda bir</option>
                <option value="10_questions">Her 10 soruda bir</option>
                <option value="disabled">Devre Dışı (Sadece Odüllü)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Oyun İçi Duyuru Kartı */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            📢 Oyun İçi Canlı Duyuru Banner'ı
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="ann-active"
                checked={settings.announcementActive}
                onChange={(e) => setSettings({ ...settings, announcementActive: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="ann-active" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                Duyuru Oyunculara Gösterilsin
              </label>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Duyuru Metni
              </label>
              <textarea
                className="input"
                rows={2}
                value={settings.announcementText}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px' }}>
              💾 Tüm Ayarları Kaydet
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
