import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    device_id: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Yetkilendirme tokenı eksik.' });
  }

  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_degistirilmeli';

  jwt.verify(token, secret, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Geçersiz token.' });
    }
    
    req.user = {
      id: decoded.id,
      device_id: decoded.device_id
    };
    next();
  });
};
