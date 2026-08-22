import express, { Response } from 'express';
import { queryOne, queryAll } from '../database';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Kullanıcı istatistikleri
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  try {
    const stats = queryOne('SELECT * FROM user_statistics WHERE user_id = ?', [userId]);
    if (!stats) return res.status(404).json({ error: 'İstatistik bulunamadı.' });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

// Başarımlar
router.get('/achievements', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const lang = (req.query.lang as string) || 'tr';
  try {
    const allAchievements = queryAll(`
      SELECT id, key, icon,
             ${lang === 'en' ? 'name_en' : 'name_tr'} as name,
             ${lang === 'en' ? 'description_en' : 'description_tr'} as description
      FROM achievements
    `);

    const userAchEarned = queryAll(
      'SELECT achievement_id, earned_at FROM user_achievements WHERE user_id = ?',
      [userId]
    );

    const result = allAchievements.map(ach => {
      const earnedInfo = userAchEarned.find(ua => ua.achievement_id === ach.id);
      return { ...ach, is_earned: !!earnedInfo, earned_at: earnedInfo?.earned_at || null };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Başarımlar yüklenemedi.' });
  }
});

export default router;
