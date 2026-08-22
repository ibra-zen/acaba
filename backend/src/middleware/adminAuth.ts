import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne, run } from '../database';

export interface AdminAuthRequest extends Request {
  admin?: { id: string; role: string };
}

export const authenticateAdmin = (req: AdminAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Admin token eksik.' });

  const secret = process.env.JWT_SECRET || 'bsm_super_secret_jwt_key';
  jwt.verify(token, secret, (err, decoded: any) => {
    if (err || decoded.type !== 'admin') {
      return res.status(403).json({ error: 'Geçersiz admin token.' });
    }
    const admin = queryOne('SELECT id, role FROM admin_users WHERE id = ?', [decoded.id]);
    if (!admin) return res.status(403).json({ error: 'Admin hesabı bulunamadı.' });

    req.admin = { id: admin.id as string, role: admin.role as string };
    next();
  });
};

// Admin işlem logları
export const logAdminAction = (adminId: string, action: string, targetType: string, targetId: string, details: string) => {
  try {
    run('INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [adminId, action, targetType, targetId, details]);
  } catch (err) {
    console.error('Admin log hatası:', err);
  }
};
