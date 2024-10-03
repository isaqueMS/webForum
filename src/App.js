// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Forum from './Forum';
import CreateForum from './CreateForum';
import forumDetalhes from './ForumDetalhes';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* Rotas protegidas */}
          <Route path="/forum" element={<PrivateRoute element={Forum} />} />
          <Route path="/createforum" element={<PrivateRoute element={CreateForum} />} />
          <Route path="/forum" element={<PrivateRoute element={forumDetalhes} />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
