import express, { Request, Response } from 'express';
import { queryOne, queryAll, run } from '../database';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Cihaz bazlı anonim giriş / kayıt
router.post('/login', (req: Request, res: Response) => {
  const { device_id, username, language } = req.body;

  if (!device_id) {
    return res.status(400).json({ error: 'Cihaz ID gerekli.' });
  }

  try {
    let user = queryOne('SELECT * FROM users WHERE device_id = ?', [device_id]);

    if (!user) {
      const newId = uuidv4();
      const generatedName = username || `User_${Math.floor(Math.random() * 1000)}`;
      run('INSERT INTO users (id, username, device_id, current_language) VALUES (?, ?, ?, ?)',
        [newId, generatedName, device_id, language || 'tr']);
      run('INSERT INTO user_statistics (user_id) VALUES (?)', [newId]);
      user = queryOne('SELECT * FROM users WHERE id = ?', [newId]);
    } else if (language || username) {
      run('UPDATE users SET current_language = COALESCE(?, current_language), username = COALESCE(?, username) WHERE id = ?',
        [language || null, username || null, user.id]);
    }

    const secret = process.env.JWT_SECRET || 'bsm_super_secret_jwt_key';
    const token = jwt.sign({ id: user.id, device_id: user.device_id, type: 'user' }, secret, { expiresIn: '365d' });

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        username: user.username,
        language: user.current_language,
        premium_status: user.premium_status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

export default router;
