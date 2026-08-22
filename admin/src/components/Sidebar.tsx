import React from 'react';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'questions', icon: '❓', label: 'Sorular' },
    { id: 'question-form', icon: '➕', label: 'Soru Ekle' },
    { id: 'users', icon: '👥', label: 'Kullanıcılar' },
    { id: 'feedback', icon: '💬', label: 'Geri Bildirimler' },
    { id: 'logs', icon: '📋', label: 'İşlem Logları' },
    { id: 'settings', icon: '⚙️', label: 'Ayarlar' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        🤔 Ben Salak mıyım?
      </div>
      
      <div className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-link ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="nav-link" style={{ color: 'var(--danger)' }} onClick={onLogout}>
          <span className="icon">🚪</span>
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
