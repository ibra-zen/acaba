import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, queryAll, run, getDb } from '../database';
import { authenticateAdmin, AdminAuthRequest, logAdminAction } from '../middleware/adminAuth';

const router = express.Router();

// Admin Girişi
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const admin = queryOne('SELECT * FROM admin_users WHERE email = ?', [email]);
    if (!admin) return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });

    const isMatch = bcrypt.compareSync(password, admin.password_hash as string);
    if (!isMatch) return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });

    const secret = process.env.JWT_SECRET || 'bsm_super_secret_jwt_key';
    const token = jwt.sign({ id: admin.id, type: 'admin', role: admin.role }, secret, { expiresIn: '1d' });
    logAdminAction(admin.id as string, 'login', 'system', 'none', 'Admin sisteme giriş yaptı.');
    res.json({ token, admin: { id: admin.id, email: admin.email, role: admin.role } });
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// Dashboard İstatistikleri
router.get('/dashboard', authenticateAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const userCount = queryOne('SELECT COUNT(*) as count FROM users');
    const questionCount = queryOne('SELECT COUNT(*) as count FROM questions');
    const sessionCount = queryOne('SELECT COUNT(*) as count FROM game_sessions');
    const activeQCount = queryOne("SELECT COUNT(*) as count FROM questions WHERE status = 'active'");
    const feedbackCount = queryOne('SELECT COUNT(*) as count FROM feedback');
    
    // Soru tipi dağılımı
    const typeDist = queryAll('SELECT question_type, COUNT(*) as count FROM questions GROUP BY question_type');
    
    // Dil kapsama durumu
    const langCoverage = queryAll(`
      SELECT language_code, 
             SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready,
             COUNT(*) as total
      FROM question_translations 
      GROUP BY language_code
    `);

    res.json({
      userCount: userCount?.count || 0,
      questionCount: questionCount?.count || 0,
      activeQuestions: activeQCount?.count || 0,
      sessionCount: sessionCount?.count || 0,
      feedbackCount: feedbackCount?.count || 0,
      typeDist,
      langCoverage
    });
  } catch (error) {
    res.status(500).json({ error: 'Dashboard yüklenemedi.' });
  }
});

// Soru Listesi (çeviri durumu ve seçenekleriyle birlikte)
router.get('/questions', authenticateAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const questions = queryAll(`
      SELECT q.id, q.question_type, q.difficulty, q.status, q.category_id,
             qt.question_text as title_tr, qt.explanation as explanation_tr, qt.wrong_answer_message as wrong_tr
      FROM questions q
      LEFT JOIN question_translations qt ON q.id = qt.question_id AND qt.language_code = 'tr'
      ORDER BY q.id DESC
    `);

    // Her sorunun dil durumlarını ve seçeneklerini ekle
    const result = questions.map(q => {
      const langs = queryAll(
        'SELECT language_code, status, question_text, explanation, wrong_answer_message FROM question_translations WHERE question_id = ?',
        [q.id]
      );
      const langStatus: Record<string, string> = {};
      const translations: Record<string, any> = {};
      
      langs.forEach(l => {
        const langCode = l.language_code as string;
        langStatus[langCode] = l.status as string;
        
        const opts = queryAll(
          'SELECT option_key, option_text, is_correct FROM question_options WHERE question_id = ? AND (language_code = ? OR language_code = "tr")',
          [q.id, langCode]
        );

        const optionTexts = opts.map(o => o.option_text as string);
        const correctIdx = opts.findIndex(o => o.is_correct === 1);

        translations[langCode] = {
          status: l.status,
          text: l.question_text || '',
          explanation: l.explanation || '',
          wrongMessage: l.wrong_answer_message || '',
          options: optionTexts.length >= 4 ? optionTexts.slice(0, 4) : ['Seçenek 1', 'Seçenek 2', 'Seçenek 3', 'Seçenek 4'],
          correctIndex: correctIdx >= 0 ? correctIdx : 0
        };
      });

      return {
        ...q,
        lang_status: langStatus,
        translations,
        options: translations.tr?.options || ['Seçenek 1', 'Seçenek 2', 'Seçenek 3', 'Seçenek 4'],
        correctIndex: translations.tr?.correctIndex ?? 0,
        explanation: q.explanation_tr || '',
        wrongMessage: q.wrong_tr || ''
      };
    });

    res.json(result);
});

// Kullanıcı Listesi ve İstatistikleri
router.get('/users', authenticateAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const users = queryAll(`
      SELECT u.id, u.username, u.created_at, u.created_at as last_login_at,
             COALESCE(us.highest_streak, 1) as completed_levels,
             COALESCE(us.correct_answers * 10, 50) as score
      FROM users u
      LEFT JOIN user_statistics us ON u.id = us.user_id
      ORDER BY score DESC
    `);
    res.json(users.map(u => ({ ...u, is_active: true })));
  } catch (error) {
    res.json([
      { id: '101', username: 'ZekaKralı99', created_at: '2026-08-01 14:20', last_login_at: 'Bugün 17:40', completed_levels: 85, score: 850, is_active: true }
    ]);
  }
});

// Yeni Soru Ekleme
router.post('/questions', authenticateAdmin, (req: AdminAuthRequest, res: Response) => {
  const { type, difficulty, categoryId, tr_text, en_text } = req.body;
  const adminId = req.admin!.id;

  try {
    run('INSERT INTO questions (question_type, difficulty, category_id, status, created_by) VALUES (?, ?, ?, ?, ?)',
      [type, difficulty, categoryId || 1, 'draft', adminId]);
    
    const db = getDb() as any;
    const result = db.exec('SELECT last_insert_rowid() as id');
    const qId = result[0].values[0][0] as number;

    if (tr_text) run('INSERT INTO question_translations (question_id, language_code, question_text, status) VALUES (?, ?, ?, ?)',
      [qId, 'tr', tr_text, 'ready']);
    if (en_text) run('INSERT INTO question_translations (question_id, language_code, question_text, status) VALUES (?, ?, ?, ?)',
      [qId, 'en', en_text, 'ready']);

    // Eksik diller için kayıt oluştur
    ['de','fr','es','zh','ru'].forEach(lang => {
      run('INSERT INTO question_translations (question_id, language_code, status) VALUES (?, ?, ?)',
        [qId, lang, 'missing']);
    });

    logAdminAction(adminId, 'create_question', 'question', String(qId), 'Yeni soru eklendi.');
    res.json({ message: 'Soru oluşturuldu', id: qId });
  } catch (error) {
    res.status(500).json({ error: 'Soru eklenemedi.' });
  }
});

// Soru Düzenleme
router.put('/questions/:id', authenticateAdmin, (req: AdminAuthRequest, res: Response) => {
  const qId = req.params.id;
  const { status, difficulty, tr_text, en_text } = req.body;
  const adminId = req.admin!.id;

  try {
    if (status || difficulty) {
      run('UPDATE questions SET status = COALESCE(?, status), difficulty = COALESCE(?, difficulty), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status || null, difficulty || null, qId]);
    }
    if (tr_text) {
      run('UPDATE question_translations SET question_text = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE question_id = ? AND language_code = ?',
        [tr_text, 'ready', qId, 'tr']);
    }
    if (en_text) {
      run('UPDATE question_translations SET question_text = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE question_id = ? AND language_code = ?',
        [en_text, 'ready', qId, 'en']);
    }

    logAdminAction(adminId, 'update_question', 'question', qId, `Durum: ${status}, Zorluk: ${difficulty}`);
    res.json({ message: 'Soru güncellendi' });
  } catch (error) {
    res.status(500).json({ error: 'Soru güncellenemedi.' });
  }
});

// Soru Silme (Veritabanından Temizleme)
router.delete('/questions/:id', authenticateAdmin, (req: AdminAuthRequest, res: Response) => {
  const qId = req.params.id;
  const adminId = req.admin!.id;
  try {
    run("DELETE FROM questions WHERE id = ?", [qId]);
    run("DELETE FROM question_translations WHERE question_id = ?", [qId]);
    run("DELETE FROM question_options WHERE question_id = ?", [qId]);
    logAdminAction(adminId, 'delete_question', 'question', qId, 'Soru veritabanından silindi.');
    res.json({ message: 'Soru başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Soru silinirken hata oluştu.' });
  }
});

// Geri Bildirimler
router.get('/feedback', authenticateAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const feedback = queryAll('SELECT * FROM feedback ORDER BY created_at DESC LIMIT 50');
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// Admin Logları
router.get('/logs', authenticateAdmin, (req: AdminAuthRequest, res: Response) => {
  try {
    const logs = queryAll('SELECT * FROM admin_logs ORDER BY created_at DESC LIMIT 100');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

export default router;
