import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { db } from './firebase'; // Certifique-se de que o caminho está correto
import { collection, getDocs } from 'firebase/firestore';

// Registrar componentes do Chart.js
ChartJS.register(LineElement, PointElement, LinearScale, Title, Tooltip, Legend);

const TasksLineChart = () => {
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksCollection = collection(db, 'tasks');
      const taskSnapshot = await getDocs(tasksCollection);
      const tasks = taskSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      processTaskData(tasks);
    };

    fetchTasks();
  }, []);

  const processTaskData = (tasks) => {
    const taskNames = [
      'Levantamento Técnico',
      'Eventos',
      'Caderno Teste',
      'Survey',
      'Atividade Remotar',
      'Viagem POE',
      'Outro',
      'Operação Assistida',
    ];
    
    // Cores para cada tarefa
    const colors = [
      'rgba(255, 99, 132, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 206, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(255, 105, 180, 1)',
      'rgba(0, 255, 0, 1)',
    ];

    const countsByDate = {};

    // Inicializar a estrutura de dados para cada tarefa
    taskNames.forEach(taskName => {
      countsByDate[taskName] = {};
    });

    tasks.forEach(task => {
      if (task.closedAt) {
        const date = new Date(task.closedAt).toLocaleDateString();
        const taskName = task.title;

        // Verifica se a tarefa está no conjunto de taskNames
        if (taskNames.includes(taskName)) {
          countsByDate[taskName][date] = (countsByDate[taskName][date] || 0) + 1;
        }
      }
    });

    // Coletar todas as datas únicas
    const allDates = new Set();
    Object.values(countsByDate).forEach(dateCounts => {
      Object.keys(dateCounts).forEach(date => {
        allDates.add(date);
      });
    });

    const sortedDates = Array.from(allDates).sort();
    setLabels(sortedDates);

    // Criar datasets para cada tarefa
    const newDatasets = taskNames.map((taskName, index) => {
      const data = sortedDates.map(date => countsByDate[taskName][date] || 0); // Define 0 se não existir contagem

      return {
        label: taskName,
        data: data,
        borderColor: colors[index],
        backgroundColor: colors[index].replace('1)', '0.2)'),
        fill: true,
        tension: 0.3,
      };
    });

    setDatasets(newDatasets);
  };

  const data = {
    labels: labels,
    datasets: datasets,
  };

  return (
    <div style={styles.container}>
      <h2>Gráfico de Tarefas Fechadas por Data</h2>
      <Line data={data} />
    </div>
  );
};

// Estilos para o componente
const styles = {
  container: {
    width: '90%',
    margin: '0 auto',
  },
};

export default TasksLineChart;
