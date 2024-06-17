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
        const response = await axios.get('https://roxiler-server-nivethan.vercel.app/bar-chart', {
          params: { month, search }
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
  }, [month, search]);

  const data = {
    labels: barData.map(item => item.range),
    datasets: [
      {
        label: 'Product Count',
        data: barData.map(item => item.count),
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
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
