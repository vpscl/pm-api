require("dotenv").config();
const express = require("express");

const PORT = process.env.PORT || 8000;
const app = express();

const { errorHandler, notFound } = require("./middleware");
const { categories, products, auth, users } = require("./routes");

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
app.use("/api/categories", categories);
app.use("/api/products", products);
app.use("/api/auth", auth);
app.use("/api/users", users);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}.`)
);
