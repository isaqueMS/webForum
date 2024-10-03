// pages/CreateForum.js
import React, { useState } from 'react';

const CreateForum = () => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
  };

  return (
    <div>
      <h1>Criar Novo Fórum</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Título do Fórum"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button type="submit">Criar</button>
      </form>
    </div>
  );
};

export default CreateForum;
