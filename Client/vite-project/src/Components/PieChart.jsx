import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import { Chart, ArcElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Title, Tooltip, Legend);
import './Chart.css';
const PieChart = ({ month, search }) => {
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    const fetchPieChartData = async () => {
      try {
        const response = await axios.get('https://roxiler-server-nivethan.vercel.app/pie-chart', {
          params: { month, search }
        });
        setPieData(response.data);
      } catch (error) {
        console.error('Error fetching pie chart data:', error);
      }
    };

    fetchPieChartData();
  }, [month, search]);

  const data = {
    labels: pieData.map(item => item._id),
    datasets: [
      {
        label: 'Category Count',
        data: pieData.map(item => item.count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
        hoverBackgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Category Distribution',
        font: {
          size: 24,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || '';
            return `${label}: ${value}`;
          },
        },
      },
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 14,
          },
          padding: 20,
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
    },
  };

  return (
    <div className="chart-container">
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart;
