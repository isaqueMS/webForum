import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase'; // Seu arquivo de configuração do Firebase
import 'chart.js/auto';

const TaskChart = () => {
  const [taskData, setTaskData] = useState(null);
  const [totalTasks, setTotalTasks] = useState(0);

  const stateList = [
    'Levantamento Técnico',
    'Eventos',
    'Caderno Teste',
    'Survey',
    'Atividade Remotar',
    'Viagem POE',
    'Outro',
    'Operação Assistida',
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'tasks'), (querySnapshot) => {
      const stateCount = {};

      // Inicializa o estado das contagens
      stateList.forEach((state) => {
        stateCount[state] = 0;
      });

      // Conta as tasks
      querySnapshot.forEach((doc) => {
        const task = doc.data();
        const state = task.title;
        if (stateList.includes(state)) {
          stateCount[state] += 1;
        }
      });

      const total = Object.values(stateCount).reduce((acc, value) => acc + value, 0);

      setTaskData({
        labels: stateList,
        datasets: [
          {
            label: 'Estados das Tasks',
            data: Object.values(stateCount),
            backgroundColor: [
              '#FF6384', // Rosa vibrante
              '#36A2EB', // Azul
              '#FFCE56', // Amarelo
              '#4BC0C0', // Verde Água
              '#9966FF', // Roxo
              '#FF9F40', // Laranja
              '#FF3D3D', // Vermelho vibrante (para Operação Assistida)
              '#4CAF50', // Verde (para Caderno Teste)
            ],
          },
        ],
      });
      setTotalTasks(total);
    });

    // Limpeza do listener quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  const chartOptions = {
    plugins: {
      legend: {
        display: false, // Remover a legenda do gráfico
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}`; // Exibe o valor no tooltip
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={styles.container}>
        <p style={styles.total}>Total de Tarefas {totalTasks}</p>
      <div style={styles.chartAndLegend}>
        <div style={styles.chartContainer}>
          {taskData ? <Pie data={taskData} options={chartOptions} /> : <p>Carregando dados...</p>}
        </div>
        <div style={styles.legendContainer}>
          {taskData && taskData.labels.map((label, i) => (
            <div key={i} style={styles.legendItem}>
              <div style={{ ...styles.colorBox, backgroundColor: taskData.datasets[0].backgroundColor[i] }} />
              <span style={{ color: '#FFFFFF' }}>{`${label}: ${taskData.datasets[0].data[i]}`}</span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartAndLegend: {
    display: 'flex',
    flexDirection: 'row', // Coloca o gráfico e a legenda lado a lado
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  chartContainer: {
    width: '60%', // Ajuste o tamanho do gráfico conforme necessário
    height: '500px', // Altura do gráfico
    maxWidth: '700px',
    display: 'flex',
  },
  legendContainer: {
    backgroundColor: '#333333', // Fundo escuro para a legenda
    borderRadius: '5px',
    padding: '20px',
    marginLeft: '20px', // Espaço entre o gráfico e a legenda
    width: '20%', // Ajuste a largura da legenda
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    margin: '5px 0',
  },
  colorBox: {
    width: '15px',
    height: '15px',
    marginRight: '10px',
  },
  total: {
    marginTop: '20px',
    fontSize: '1.6em', // Tamanho da fonte do total
    fontWeight: 'bold',
    color: '#ffff',
  },
};

export default TaskChart;
