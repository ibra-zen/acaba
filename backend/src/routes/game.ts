import express, { Response } from 'express';
import { queryOne, run } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Yeni oyun oturumu başlat
router.post('/session', authenticateToken, (req: AuthRequest, res: Response) => {
  const { game_mode } = req.body;
  const userId = req.user!.id;
  const sessionId = uuidv4();

  try {
    run('INSERT INTO game_sessions (id, user_id, game_mode) VALUES (?, ?, ?)',
      [sessionId, userId, game_mode || 'classic']);
    res.json({ message: 'Oturum başlatıldı.', session_id: sessionId });
  } catch (error) {
    res.status(500).json({ error: 'Oturum başlatılamadı.' });
  }
});

// Cevap kaydet ve istatistikleri güncelle
router.post('/answer', authenticateToken, (req: AuthRequest, res: Response) => {
  const { session_id, question_id, user_answer, is_correct, answer_time_ms } = req.body;
  const userId = req.user!.id;

  try {
    // Cevabı kaydet
    run('INSERT INTO answers (session_id, question_id, user_answer, is_correct, answer_time_ms) VALUES (?, ?, ?, ?, ?)',
      [session_id, question_id, user_answer, is_correct ? 1 : 0, answer_time_ms || 0]);

    // Oturum metriklerini güncelle
    if (is_correct) {
      run('UPDATE game_sessions SET correct_answers = correct_answers + 1, total_questions = total_questions + 1 WHERE id = ?',
        [session_id]);
    } else {
      run('UPDATE game_sessions SET total_questions = total_questions + 1 WHERE id = ?', [session_id]);
    }

    res.json({ message: 'Cevap kaydedildi.' });
  } catch (error) {
    res.status(500).json({ error: 'Cevap kaydedilemedi.' });
  }
});

// Oturumu sonlandır ve toplam istatistikleri güncelle
router.put('/session/:id/end', authenticateToken, (req: AuthRequest, res: Response) => {
  const sessionId = req.params.id;
  const { score } = req.body;
  const userId = req.user!.id;

  try {
    const session = queryOne('SELECT * FROM game_sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
    if (!session) return res.status(404).json({ error: 'Oturum bulunamadı.' });

    run('UPDATE game_sessions SET ended_at = CURRENT_TIMESTAMP, score = ? WHERE id = ?',
      [score || 0, sessionId]);

    // Kullanıcı istatistiklerini güncelle
    const wrongCount = (session.total_questions as number) - (session.correct_answers as number);
    run(`UPDATE user_statistics 
         SET total_played = total_played + ?,
             correct_answers = correct_answers + ?,
             wrong_answers = wrong_answers + ?,
             last_played_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
      [session.total_questions, session.correct_answers, wrongCount, userId]);

    res.json({ message: 'Oyun bitti.', final_score: score || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Oturum sonlandırılamadı.' });
  }
});

export default router;
