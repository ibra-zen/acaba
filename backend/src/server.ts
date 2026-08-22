import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './database';

// Route imports
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import questionsRoutes from './routes/questions';
import gameRoutes from './routes/game';
import statsRoutes from './routes/stats';
import feedbackRoutes from './routes/feedback';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: '🤔 Ben Salak mıyım? API çalışıyor!' });
});

// API Rotaları
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/feedback', feedbackRoutes);

// Hata yönetimi
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Sunucu hatası:', err.stack);
  res.status(500).json({ error: 'Beklenmeyen bir sunucu hatası oluştu.' });
});

// Veritabanını başlat, ardından sunucuyu aç
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor`);
    console.log(`📊 Admin Panel: http://localhost:5173`);
    console.log(`🎮 Simülatör: app_simulator/index.html`);
  });
}).catch(err => {
  console.error('❌ Veritabanı başlatılamadı:', err);
  process.exit(1);
});
