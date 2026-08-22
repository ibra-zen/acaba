import express, { Response } from 'express';
import { run } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Soruya geri bildirim bırak
router.post('/', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { question_id, rating_type, comment } = req.body;

  if (!question_id || !rating_type) {
    return res.status(400).json({ error: 'Soru ID ve değerlendirme türü zorunludur.' });
  }

  try {
    run('INSERT INTO feedback (question_id, user_id, rating_type, comment) VALUES (?, ?, ?, ?)',
      [question_id, userId, rating_type, comment || null]);
    res.json({ message: 'Geri bildiriminiz için teşekkürler.' });
  } catch (error) {
    res.status(500).json({ error: 'Geri bildirim kaydedilemedi.' });
  }
});

export default router;
