const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const Product = require("./Product");

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["https://roxiler-pro.vercel.app", "http://localhost:5173"],
  })
);
app.use(morgan("combined"));

// MongoDB Atlas connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

const db = mongoose.connection;
db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});
db.once("open", () => {
  console.log("Connected to MongoDB Atlas");
});

app.get("/products", async (req, res) => {
  try {
    const url = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";
    const response = await axios.get(url);
    const productData = response.data;

    await Product.deleteMany({});

    await Product.insertMany(productData);

    res.send("Products fetched and saved to MongoDB");
  } catch (error) {
    console.error("Error fetching and saving products:", error);
    res.status(500).send("Error fetching and saving products");
  }
});

// Utility function to get month number (0 for January, 1 for February, etc.)
const getMonthNumber = (month) => {
  const months = [
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
  ];
  return months.indexOf(month.toLowerCase()); // 0-based index
};

function toFloatIfValid(value) {
  if (typeof value !== "string") {
    return { minPrice: null, maxPrice: null };
  }
  // Use a regular expression to check for a valid float format
  const floatRegex = /^-?\d+(\.\d+)?$/;
  if (!floatRegex.test(value)) {
    return { minPrice: null, maxPrice: null };
  }
  // Use parseFloat to ensure it's a valid number
  const number = parseFloat(value);
  return isNaN(number)
    ? { minPrice: null, maxPrice: null }
    : { minPrice: number - 100, maxPrice: number + 100 };
}

// GET - Transactions with search and pagination
app.get("/transactions", async (req, res) => {
  const { page = 1, search = "", month = "march" } = req.query;
  const perPage = 10;

  const monthIndex = getMonthNumber(month);
  if (monthIndex === -1) {
    return res.status(400).send("Invalid month");
  }
  const { minPrice, maxPrice } = toFloatIfValid(search);
  const searchTerm = search || "";
  let pipeline = [];
  if (minPrice === null) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      },
    });
  } else {
    pipeline.push({
      $match: {
        $expr: {
          $and: [
            { $gte: ["$price", minPrice] },
            { $lte: ["$price", maxPrice] },
            { $eq: [{ $type: "$price" }, "double"] },
          ],
        },
      },
    });
  }

  pipeline.push(
    {
      $match: {
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, monthIndex + 1],
        },
      },
    },
    {
      $sort: { price: 1 },
    }
  );

  try {
    const results = await Product.aggregate(pipeline);

    const total = results.length;
    const paginatedResults = results.slice(
      (page - 1) * perPage,
      page * perPage
    );

    res.json({
      products: paginatedResults,
      total,
      page: parseInt(page),
      perPage: parseInt(perPage),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).send("Error fetching transactions");
  }
});

// GET - Bar chart data for the selected month
app.get("/bar-chart", async (req, res) => {
  const { month = "march", search = "" } = req.query;
  const monthIndex = getMonthNumber(month);

  if (monthIndex === -1) {
    return res.status(400).send("Invalid month");
  }

  const { minPrice, maxPrice } = toFloatIfValid(search);
  const searchTerm = search || "";

  let pipeline = [];

  if (minPrice === null) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      },
    });
  } else {
    pipeline.push({
      $match: {
        $expr: {
          $and: [
            { $gte: ["$price", minPrice] },
            { $lte: ["$price", maxPrice] },
            { $eq: [{ $type: "$price" }, "double"] },
          ],
        },
      },
    });
  }

  pipeline.push(
    {
      $match: {
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, monthIndex + 1],
        },
      },
    },
    {
      $sort: { price: 1 },
    }
  );

  try {
    const products = await Product.aggregate(pipeline);

    const ranges = [
      { range: "0-100", min: 0, max: 100, count: 0 },
      { range: "101-200", min: 101, max: 200, count: 0 },
      { range: "201-300", min: 201, max: 300, count: 0 },
      { range: "301-400", min: 301, max: 400, count: 0 },
      { range: "401-500", min: 401, max: 500, count: 0 },
      { range: "501-600", min: 501, max: 600, count: 0 },
      { range: "601-700", min: 601, max: 700, count: 0 },
      { range: "701-800", min: 701, max: 800, count: 0 },
      { range: "801-900", min: 801, max: 900, count: 0 },
      { range: "901-above", min: 901, max: Infinity, count: 0 },
    ];

    products.forEach((product) => {
      ranges.forEach((range) => {
        if (product.price >= range.min && product.price <= range.max) {
          range.count += 1;
        }
      });
    });

    res.json(ranges);
  } catch (error) {
    console.error("Error fetching bar chart data:", error);
    res.status(500).send("Error fetching bar chart data");
  }
});

// GET - Pie chart data for unique categories in the selected month
app.get("/pie-chart", async (req, res) => {
  const { month = "march", search = "" } = req.query;
  const monthIndex = getMonthNumber(month);

  if (monthIndex === -1) {
    return res.status(400).send("Invalid month");
  }

  const { minPrice, maxPrice } = toFloatIfValid(search);
  const searchTerm = search || "";

  let pipeline = [];

  if (minPrice === null) {
    pipeline.push({
      $match: {
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      },
    });
  } else {
    pipeline.push({
      $match: {
        $expr: {
          $and: [
            { $gte: ["$price", minPrice] },

            { $lte: ["$price", maxPrice] },
            { $eq: [{ $type: "$price" }, "double"] },
          ],
        },
      },
    });
  }

  pipeline.push(
    {
      $match: {
        $expr: {
          $eq: [{ $month: "$dateOfSale" }, monthIndex + 1],
        },
      },
    },
    {
      $group: { _id: "$category", count: { $sum: 1 } },
    }
  );

  try {
    const categories = await Product.aggregate(pipeline);

    res.json(categories);
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
    res.status(500).send("Error fetching pie chart data");
  }
});

// GET - Statistics for the selected month
app.get("/statistics", async (req, res) => {
  const { month } = req.query;
  const monthIndex = getMonthNumber(month);

  // Validate the month
  if (monthIndex === -1) {
    return res.status(400).send("Invalid month");
  }

  // Construct the query to match the date of sale in the specified month
  const query = {
    $expr: {
      $eq: [{ $month: "$dateOfSale" }, monthIndex + 1],
    },
  };

  try {
    // Aggregate to get the total sales amount for the specified month
    const totalSaleAmountResult = await Product.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    // Count the number of sold items for the specified month
    const soldItems = await Product.countDocuments({ ...query, sold: true });

    // Count the number of not sold items for the specified month
    const notSoldItems = await Product.countDocuments({
      ...query,
      sold: false,
    });

    // Respond with the statistics
    res.json({
      totalSaleAmount: totalSaleAmountResult[0]?.total || 0,
      soldItems,
      notSoldItems,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).send("Error fetching statistics");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// module.exports = app;
