import express, { Response } from 'express';
import { queryAll, queryOne, run } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Aktif soruları dil parametresine göre getir
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const language = (req.query.lang as string) || 'tr';
  const limit = parseInt((req.query.limit as string) || '10', 10);

  try {
    // Aktif ve çevirisi hazır soruları getir
    const questions = queryAll(`
      SELECT q.id, q.question_type, q.difficulty, q.category_id,
             qt.question_text, qt.explanation, qt.wrong_answer_message
      FROM questions q
      JOIN question_translations qt ON q.id = qt.question_id
      WHERE q.status = 'active' AND qt.language_code = ? AND qt.status = 'ready'
      ORDER BY RANDOM()
      LIMIT ?
    `, [language, limit]);

    // Çevirisi hazır değilse Türkçeye fallback yap
    const result = questions.map(q => {
      let options = queryAll(
        'SELECT option_key, option_text, is_correct FROM question_options WHERE question_id = ? AND language_code = ?',
        [q.id, language]
      );
      // Seçenekler yoksa Türkçe seçenekleri al
      if (!options.length) {
        options = queryAll(
          'SELECT option_key, option_text, is_correct FROM question_options WHERE question_id = ? AND language_code = ?',
          [q.id, 'tr']
        );
      }
      return { ...q, options };
    });

    res.json({ questions: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sorular yüklenirken hata oluştu.' });
  }
});

// Günlük soruları getir
router.get('/daily', authenticateToken, (req: AuthRequest, res: Response) => {
  const language = (req.query.lang as string) || 'tr';
  const today = new Date().toISOString().split('T')[0];

  try {
    let challenge = queryOne('SELECT * FROM daily_challenges WHERE challenge_date = ?', [today]);
    let qIds: number[] = [];

    if (!challenge) {
      const randomQuestions = queryAll('SELECT id FROM questions WHERE status = ? ORDER BY RANDOM() LIMIT 10', ['active']);
      qIds = randomQuestions.map(q => q.id as number);
      run('INSERT INTO daily_challenges (challenge_date, question_ids) VALUES (?, ?)',
        [today, JSON.stringify(qIds)]);
    } else {
      qIds = JSON.parse(challenge.question_ids as string);
    }

    // ID listesiyle soruları getir
    const result = qIds.map(qId => {
      let q = queryOne(`
        SELECT q.id, q.question_type, q.difficulty, qt.question_text
        FROM questions q
        JOIN question_translations qt ON q.id = qt.question_id
        WHERE q.id = ? AND qt.language_code = ?
      `, [qId, language]);

      if (!q) {
        q = queryOne(`
          SELECT q.id, q.question_type, q.difficulty, qt.question_text
          FROM questions q
          JOIN question_translations qt ON q.id = qt.question_id
          WHERE q.id = ? AND qt.language_code = 'tr'
        `, [qId]);
      }
      if (!q) return null;

      const options = queryAll(
        'SELECT option_key, option_text, is_correct FROM question_options WHERE question_id = ? AND language_code = ?',
        [qId, language]
      );
      return { ...q, options };
    }).filter(Boolean);

    res.json({ daily_challenge: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Günlük görev yüklenemedi.' });
  }
});

// 10'lu grup seviye paketi sorularını getir (On-Demand Pack Fetching - 8 Dil Destekli)
router.get('/pack/:packId', (req: express.Request, res: Response) => {
  const packId = parseInt(req.params.packId, 10) || 1;
  const language = (req.query.lang as string) || 'tr';
  const startLevel = (packId - 1) * 10 + 1;
  const endLevel = packId * 10;

  try {
    let questions = queryAll(`
      SELECT q.id, q.priority as level_num, qt.question_text, qt.explanation
      FROM questions q
      JOIN question_translations qt ON q.id = qt.question_id
      WHERE q.priority >= ? AND q.priority <= ? AND qt.language_code = ?
      ORDER BY q.priority ASC, q.id ASC
    `, [startLevel, endLevel, language]);

    // Eğer o dilde çeviri yoksa Türkçe fallback yap
    if (!questions.length) {
      questions = queryAll(`
        SELECT q.id, q.priority as level_num, qt.question_text, qt.explanation
        FROM questions q
        JOIN question_translations qt ON q.id = qt.question_id
        WHERE q.priority >= ? AND q.priority <= ? AND qt.language_code = 'tr'
        ORDER BY q.priority ASC, q.id ASC
      `, [startLevel, endLevel]);
    }

    const result = questions.map(q => {
      let options = queryAll(
        'SELECT option_text, is_correct FROM question_options WHERE question_id = ? AND language_code = ? ORDER BY id ASC',
        [q.id, language]
      );
      if (!options.length) {
        options = queryAll(
          'SELECT option_text, is_correct FROM question_options WHERE question_id = ? AND language_code = ? ORDER BY id ASC',
          [q.id, 'tr']
        );
      }
      const opts = options.map(o => o.option_text);
      const correctIndex = options.findIndex(o => o.is_correct === 1);
      return {
        id: q.id,
        level: q.level_num || startLevel,
        tag: `Level ${q.level_num || startLevel}`,
        q: q.question_text,
        opts: opts.length ? opts : ['A', 'B', 'C', 'D'],
        correct: correctIndex >= 0 ? correctIndex : 0,
        exp: q.explanation || 'Harika çözüm!'
      };
    });

    res.json({
      packId,
      language,
      startLevel,
      endLevel,
      questionsCount: result.length,
      questions: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Paket soruları yüklenirken hata oluştu.' });
  }
});

export default router;
