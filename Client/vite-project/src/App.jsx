import React, { useState, useEffect } from "react";
import Pagination from "./Components/Pagination";
import BarChart from "./Components/BarChart";
import PieChart from "./Components/PieChart";
import axios from "axios";
import "./App.css";

function App() {
  const [month, setMonth] = useState("january");
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    soldItems: 0,
    notSoldItems: 0,
  });

  const handleMonthChange = async (event) => {
    const selectedMonth = event.target.value;
    setMonth(selectedMonth);
    await fetchStatistics(selectedMonth);
  };

  const fetchStatistics = async (selectedMonth) => {
    try {
      const response = await axios.get(
        `https://roxiler-server-nivethan.vercel.app/statistics`,
        {
          params: { month: selectedMonth },
        }
      );
      setStatistics(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchStatistics(month);
  }, [month]);

  return (
    <div className="App">
      <header className="header">
        <h1>Roxiler Product-Transaction</h1>
      </header>
      <main>
        <section className="statistics-section">
          <h2 className="section-heading">Statistics</h2>
          <div className="month-selector">
            <label htmlFor="month">Select Month:</label>
            <select id="month" value={month} onChange={handleMonthChange}>
              {[
                "january",
                "february",
                "march",
                "april",
                "may",
                "june",
                "july",
                "august",
                "september",
                "october",
                "november",
                "december",
              ].map((m) => (
                <option key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="statistics">
            <div className="stat-box">
              <h3>Total Sale Amount</h3>
              <p>${statistics.totalSaleAmount.toFixed(2)}</p>
            </div>
            <div className="stat-box">
              <h3>Total Sold Items</h3>
              <p>{statistics.soldItems}</p>
            </div>
            <div className="stat-box">
              <h3>Total Not Sold Items</h3>
              <p>{statistics.notSoldItems}</p>
            </div>
          </div>
        </section>
        <section className="charts-container">
          <div className="chart left-chart">
            <h2>Bar Chart</h2>
            <BarChart month={month} />
          </div>
          <div className="chart right-chart">
            <h2>Pie Chart</h2>
            <PieChart month={month} />
          </div>
        </section>
        <section className="pagination-section">
          <Pagination />
        </section>
      </main>
    </div>
  );
}

export default App;
