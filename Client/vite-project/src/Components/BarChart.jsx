import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart, CategoryScale, LinearScale, Title, BarElement } from 'chart.js';
Chart.register(CategoryScale, LinearScale, Title, BarElement);
import './Chart.css';

const BarChart = ({ month, search }) => {
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBarChartData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/bar-chart', {
          params: { month }
        });
        setBarData(response.data);
      } catch (error) {
        console.error('Error fetching bar chart data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchBarChartData();
  }, [month]);

  const data = {
    labels: barData.map(item => item.range), // Assuming 'range' represents the labels on x-axis
    datasets: [
      {
        label: 'Product Count',
        data: barData.map(item => item.count), // Assuming 'count' represents the data on y-axis
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category', // Specify the scale type for x-axis
        title: {
          display: true,
          text: 'Price', // Label for x-axis
          color: '#333', // Color of the label
          font: {
            size: 16, // Font size of the label
            weight: 'bold' // Font weight of the label
          }
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Product Count', // Label for y-axis
          color: '#333', // Color of the label
          font: {
            size: 16, // Font size of the label
            weight: 'bold' // Font weight of the label
          }
        },
      },
    },
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="chart-container">
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
