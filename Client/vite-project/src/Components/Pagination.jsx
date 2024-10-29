import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Pagination.css";
import yes from "../assets/yes.png";
import no from "../assets/no.png";

function formatDate(currentDate) {
  const date = new Date(currentDate);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
}

const TransactionsTable = ({ products = [] }) => (
  <div className="table-responsive">
    <table className="table table-striped table-bordered">
      <thead className="thead-dark">
        <tr>
          <th>S.NO</th>
          <th>Title</th>
          <th>Category</th>
          <th>Description</th>
          <th>Price</th>
          <th>Image</th>
          <th>Date of Sale</th>
          <th>Sold</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{product.title}</td>
            <td>{product.category}</td>
            <td>{product.description}</td>
            <td>{product.price.toFixed(2)}</td>
            <td>
              <img
                src={product.image}
                alt={product.title}
                className="img-thumbnail"
              />
            </td>
            <td>{formatDate(product.dateOfSale)}</td>
            <td>
              {product.sold ? (
                <img src={yes} alt="Yes" width="20" />
              ) : (
                <img src={no} alt="No" width="20" />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Pagination = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedMonth]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3001/transactions",
        {
          params: {
            month: selectedMonth,
            search: searchTerm,
            page: currentPage,
          },
        }
      );
      const productsData = response.data.products || [];
      setProducts(productsData);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (error) {
      console.error("Error fetching products:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Transaction Dashboard</h1>
      <div className="row mb-3">
        <div className="col-md-6 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search transaction"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="col-md-6 mb-3">
          <select
            className="form-control"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>
      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="sr-only"></span>
          </div>
        </div>
      ) : (
        <TransactionsTable products={products} />
      )}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button
          className="btn btn-primary"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-primary"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
         Next
        </button>
      </div>
    </div>
  );
};
export default Pagination;