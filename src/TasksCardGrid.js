import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase'; // Certifique-se de que você está importando o Firebase corretamente

const TasksCardGrid = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar dados de tarefas e usuários associados
  const fetchTasksAndUsers = () => {
    const tasksQuery = query(collection(db, 'tasks'), where('status', '==', 'Pendente'));
    
    // Usando onSnapshot para escutar mudanças em tempo real
    const unsubscribe = onSnapshot(tasksQuery, async (querySnapshot) => {
      const tasksData = [];

      // Atualiza o estado de loading antes de iniciar a busca
      setLoading(true);

      if (querySnapshot.empty) {
        console.log('Nenhuma tarefa encontrada com status "Pendente".');
        setLoading(false);
        return;
      }

      for (const taskDoc of querySnapshot.docs) {
        const taskData = taskDoc.data();
        const userId = taskData.userId;

        console.log('Dados da tarefa:', taskData);

        if (userId) {
          const userRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            console.log('Dados do usuário:', userData);

            tasksData.push({
              id: taskDoc.id,
              taskTitle: taskData.title,
              fullName: userData.fullName,
              firstName: userData.firstName,
              photoURL: userData.photoURL,
            });
          } else {
            console.log(`Usuário com ID ${userId} não encontrado.`);
          }
        } else {
          console.log(`Tarefa com ID ${taskDoc.id} não tem um userId.`);
        }
      }

      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao escutar tarefas:', error);
      setLoading(false);
    });

    // Limpa o listener quando o componente é desmontado
    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchTasksAndUsers();
    return () => unsubscribe(); // Limpeza do listener
  }, []);

  if (loading) {
    return <div style={{ color: 'white' }}>Carregando...</div>; // Texto de carregamento no tema escuro
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Relatório das Atividades Pendentes</h1>
      <div style={styles.gridContainer}>
        {tasks.length === 0 ? (
          <p style={{ color: 'white' }}>Nenhuma tarefa pendente encontrada.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} style={styles.card}>
              {task.photoURL && (
                <img src={task.photoURL} alt={task.firstName || 'Foto'} style={styles.photo} />
              )}
              <h3 style={styles.title}>{task.fullName}</h3>
              <p style={styles.taskText}>{task.taskTitle}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Estilos do componente
const styles = {
  container: {
    padding: '20px',
   
    borderRadius: '8px',
  },
  title: {
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '20px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', // Responsivo
    gap: '15px',
  },
  card: {
    border: '3px solid #ff5722',
    borderRadius: '10px',
    padding: '10px',
    textAlign: 'center',
    backgroundColor: '#1e1e1e',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    animation: 'blinkingBorder 1.5s infinite',
  },
  photo: {
    width: '100%',
    height: '120px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  taskText: {
    color: '#b0b0b0',
  },
};

// Animação para a borda piscante
const blinkAnimation = document.createElement('style');
blinkAnimation.type = 'text/css';
blinkAnimation.innerHTML = `
  @keyframes blinkingBorder {
    0% { border-color: #ff5722; }
    50% { border-color: transparent; }
    100% { border-color: #ff5722; }
  }
`;
document.head.appendChild(blinkAnimation);

export default TasksCardGrid;
