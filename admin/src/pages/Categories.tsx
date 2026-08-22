import React, { useState } from 'react';

interface CategoryItem {
  id: number;
  icon: string;
  name_tr: string;
  name_en: string;
  name_de: string;
  question_count: number;
  is_active: boolean;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: 1, icon: '👀', name_tr: 'Dikkat', name_en: 'Attention', name_de: 'Aufmerksamkeit', question_count: 8, is_active: true },
    { id: 2, icon: '🔢', name_tr: 'Mantık', name_en: 'Logic', name_de: 'Logik', question_count: 6, is_active: true },
    { id: 3, icon: '🧠', name_tr: 'Hafıza', name_en: 'Memory', name_de: 'Gedächtnis', question_count: 5, is_active: true },
    { id: 4, icon: '⚡', name_tr: 'Refleks', name_en: 'Reflex', name_de: 'Reflexe', question_count: 2, is_active: true },
    { id: 5, icon: '🕐', name_tr: 'Sabır', name_en: 'Patience', name_de: 'Geduld', question_count: 3, is_active: true },
    { id: 6, icon: '📚', name_tr: 'Genel', name_en: 'General', name_de: 'Allgemein', question_count: 4, is_active: true },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({ icon: '🏷️', name_tr: '', name_en: '', name_de: '' });

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ icon: '🏷️', name_tr: '', name_en: '', name_de: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormData({ icon: cat.icon, name_tr: cat.name_tr, name_en: cat.name_en, name_de: cat.name_de });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_tr.trim()) return;

    if (editingCategory) {
      setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...formData } : c));
    } else {
      const newCat: CategoryItem = {
        id: Date.now(),
        ...formData,
        question_count: 0,
        is_active: true
      };
      setCategories([...categories, newCat]);
    }
    setShowModal(false);
  };

  const toggleActive = (id: number) => {
    setCategories(categories.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
  };

  return (
    <div className="categories-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>🏷️ Kategori Yönetimi</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Oyun içindeki soru kategorilerini ve dil çevirilerini yönetin.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          ➕ Yeni Kategori Ekle
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {categories.map((cat) => (
          <div key={cat.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '32px', background: 'var(--bg-card-hover)', padding: '8px', borderRadius: '12px' }}>
                  {cat.icon}
                </span>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{cat.name_tr}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{cat.name_en}</span>
                </div>
              </div>
              <span className={`badge ${cat.is_active ? 'badge-success' : 'badge-danger'}`}>
                {cat.is_active ? 'Aktif' : 'Pasif'}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>❓ {cat.question_count} Soru</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => handleOpenEdit(cat)}>
                  ✏️ Düzenle
                </button>
                <button className={`btn ${cat.is_active ? 'btn-danger' : 'btn-primary'}`} style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => toggleActive(cat.id)}>
                  {cat.is_active ? 'Pasife Al' : 'Aktif Et'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
              {editingCategory ? '✏️ Kategori Düzenle' : '➕ Yeni Kategori Ekle'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>İkon (Emoji)</label>
                <input
                  type="text"
                  className="input"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  maxLength={4}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Türkçe İsim</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name_tr}
                  onChange={(e) => setFormData({ ...formData, name_tr: e.target.value })}
                  placeholder="Örn: Mantık"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>İngilizce İsim</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Örn: Logic"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>Almanca İsim</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name_de}
                  onChange={(e) => setFormData({ ...formData, name_de: e.target.value })}
                  placeholder="Örn: Logik"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
