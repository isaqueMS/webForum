import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { db } from './firebase'; // Certifique-se de que o caminho está correto
import { collection, getDocs } from 'firebase/firestore';

// Registrar componentes do Chart.js
ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const TasksBarChart = () => {
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
        const date = new Date(task.closedAt);
        const formattedDate = date.toLocaleDateString('pt-BR'); // Formatação em Pt-BR
        const taskName = task.title;

        // Verifica se a tarefa está no conjunto de taskNames
        if (taskNames.includes(taskName)) {
          countsByDate[taskName][formattedDate] = (countsByDate[taskName][formattedDate] || 0) + 1;
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

    const sortedDates = Array.from(allDates).sort((a, b) => {
      const dateA = new Date(a.split('/').reverse().join('/')); // Conversão para Date
      const dateB = new Date(b.split('/').reverse().join('/'));
      return dateA - dateB; // Comparação de datas
    });

    setLabels(sortedDates);

    // Criar datasets para cada tarefa
    const newDatasets = taskNames.map((taskName, index) => {
      const data = sortedDates.map(date => countsByDate[taskName][date] || 0); // Define 0 se não existir contagem

      return {
        label: taskName,
        data: data,
        backgroundColor: colors[index],
      };
    });

    setDatasets(newDatasets);
    setFilteredData(newDatasets); // Inicialmente, os dados filtrados são iguais aos dados completos
  };

  // Filtrar dados por data
  const filterData = () => {
    if (!startDate || !endDate) {
      setFilteredData(datasets); // Se as datas não forem definidas, exibe todos os dados
      return;
    }

    const filteredDatasets = datasets.map(dataset => {
      const filteredData = dataset.data.map((value, index) => {
        const date = new Date(labels[index].split('/').reverse().join('/')); // Conversão para Date
        return (date >= new Date(startDate) && date <= new Date(endDate)) ? value : 0;
      });
      return { ...dataset, data: filteredData };
    });

    setFilteredData(filteredDatasets); // Atualiza os dados filtrados
  };

  const data = {
    labels: labels,
    datasets: filteredData,
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gráfico de Tarefas Fechadas por Data</h2>
      <div style={styles.dateFilters}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={styles.dateInput}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={styles.dateInput}
        />
        <button onClick={filterData} style={styles.filterButton}>Filtrar</button>
      </div>
      <Bar data={data} options={styles.chartOptions} />
    </div>
  );
};

// Estilos para o componente
const styles = {
  container: {
    width: '70%',
    margin: '0 auto',
    color: '#FFFFFF', // Cor do texto para contraste em fundo preto
    
    padding: '20px',
    borderRadius: '8px',
  },
  title: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  dateFilters: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
  },
  dateInput: {
    marginRight: '10px',
    backgroundColor: '#333333', // Fundo dos inputs
    color: '#FFFFFF', // Cor do texto dos inputs
    border: '1px solid #FFFFFF', // Borda dos inputs
    borderRadius: '4px',
    padding: '5px',
  },
  filterButton: {
    padding: '5px 10px',
    backgroundColor: '#007BFF', // Cor do botão
    color: '#FFFFFF', // Cor do texto do botão
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  chartOptions: {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#FFFFFF', // Cor da legenda do gráfico
        },
      },
    },
  },
};

export default TasksBarChart;
