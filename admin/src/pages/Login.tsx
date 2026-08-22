import React, { useState } from 'react';
import { api } from '../api';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const res = await api.login(email, password);
    setIsLoading(false);

    if (res.success) {
      onLoginSuccess();
    } else {
      setError(res.error || 'Giriş başarısız');
    }
  };

  return (
    <div className="login-page">
      <div className="glass-card login-form">
        <div className="login-header">
          <h1>🤔 BEN SALAK MIYIM?</h1>
          <p>Yönetim Paneli</p>
        </div>
        
        {error && <div className="error-msg">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Kullanıcı Adı</label>
            <input 
              type="text" 
              className="input" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="adminidiot"
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input 
              type="password" 
              className="input" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required 
            />
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
