import React, { useState, useEffect } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Questions from './pages/Questions';
import QuestionForm from './pages/QuestionForm';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Feedback from './pages/Feedback';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import { api } from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
  };

  const handleEditQuestion = (q: any) => {
    setEditingQuestion(q);
    setActivePage('question-form');
  };

  const handleAddNewQuestion = () => {
    setEditingQuestion(null);
    setActivePage('question-form');
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'questions':
        return (
          <Questions
            onAddNew={handleAddNewQuestion}
            onEditQuestion={handleEditQuestion}
          />
        );
      case 'question-form':
        return (
          <QuestionForm
            questionToEdit={editingQuestion}
            onSave={() => setActivePage('questions')}
            onCancel={() => setActivePage('questions')}
          />
        );
      case 'categories':
        return <Categories />;
      case 'users':
        return <Users />;
      case 'feedback':
        return <Feedback onEditQuestion={handleEditQuestion} />;
      case 'logs':
        return <Logs />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
