const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const jwt = require("jsonwebtoken");
const authRoutes = require("./authRoutes");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const BASE_URL=process.env.BASE_URL;
const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});


app.use(cors());
app.use(bodyParser.json());
app.use("/auth", authRoutes);

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "",
  database: "transactions_db",
});

app.use(cors());
app.use(express.json());

// Store all live clients
let liveClients = [];

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);
  liveClients.push(socket.id);

  // Send initial user count and transaction totals to the client
  sendTransactionTotals(socket);
  sendTotalUserCount(socket);

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected: ", socket.id);
    liveClients = liveClients.filter((id) => id !== socket.id);
  });
});
// server.js

app.get("/count", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) AS total_users FROM user_data"
    );
    const totalUsers = result.rows[0].total_users;
    res.status(200).json({ totalUsers });
  } catch (error) {
    console.error("Error fetching total users:", error);
    res.status(500).json({ error: "Error fetching total users" });
  }
});
app.get("/live", async (req, res) => {
  try {
    const transactions = await pool.query(
      "SELECT * FROM transactions ORDER BY date DESC"
    );
    res.json(transactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
app.put("/transaction/:id", async (req, res) => {
  const { id } = req.params;
  const { date, amount, description } = req.body;

  try {
    const result = await pool.query(
      "UPDATE transactions SET date = $1, amount = $2, description = $3 WHERE id = $4 RETURNING *",
      [date, amount, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/lives", async (req, res) => {
  try {
    const transactions = await pool.query(`
          SELECT id, date, from_user_name, to_user_name, amount, description 
          FROM transactions 
          ORDER BY date DESC
      `);
    res.json(transactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Send live transaction totals to all clients
const sendTransactionTotals = async (socket = null) => {
  try {
    const result = await pool.query(`
      SELECT 
        SUM(CASE WHEN from_user_name IS NOT NULL THEN amount ELSE 0 END) AS totalDebit,
        SUM(CASE WHEN from_user_name IS NULL THEN amount ELSE 0 END) AS totalCredit
      FROM transactions;
    `);

    const totals = {
      totalDebit: result.rows[0].totaldebit || 0,
      totalCredit: result.rows[0].totalcredit || 0,
      balance:
        (result.rows[0].totalcredit || 0) - (result.rows[0].totaldebit || 0),
    };

    // If a specific socket is passed, send totals only to that socket
    if (socket) {
      socket.emit("transactionTotals", totals);
    } else {
      // Otherwise, broadcast to all connected clients
      io.emit("transactionTotals", totals);
    }
  } catch (err) {
    console.error("Error fetching transaction totals:", err);
  }
};

// Send live user count to all clients
const sendTotalUserCount = async (socket = null) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) AS totalUsers FROM user_data;"
    );
    const totalUsers = result.rows[0].totalusers;

    // Send user count to a specific socket or broadcast to all clients
    if (socket) {
      socket.emit("totalUserCount", totalUsers);
    } else {
      io.emit("totalUserCount", totalUsers);
    }
  } catch (err) {
    console.error("Error fetching total user count:", err);
  }
};

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, "your_jwt_secret", {
    expiresIn: "1h",
  });
};
app.get("/transaction/totals", async (req, res) => {
  try {
    // Query to fetch all transactions
    const result = await pool.query(`
      SELECT 
        amount,
        from_user_name,
        to_user_name
      FROM transactions
    `);

    const transactions = result.rows;

    console.log("Fetched Transactions:", transactions); // Debugging to check fetched data

    // Initialize total debit and credit
    let totalDebit = 0;
    let totalCredit = 0;

    // Loop through all transactions and calculate totals
    transactions.forEach((transaction) => {
      const { amount, from_user_name, to_user_name } = transaction;

      console.log(
        `Processing transaction: Amount = ${amount}, From = ${from_user_name}, To = ${to_user_name}`
      );

      // Check if it's a debit
      if (from_user_name) {
        totalDebit += parseFloat(amount);
      }

      // Check if it's a credit
      if (to_user_name) {
        totalCredit += parseFloat(amount);
      }
    });

    // Calculate balance (credit - debit)
    const balance = totalCredit - totalDebit;

    console.log(
      `Total Debit: ${totalDebit}, Total Credit: ${totalCredit}, Balance: ${balance}`
    ); // Debugging totals

    // Send response with totals
    res.json({
      totalDebit,
      totalCredit,
      balance,
    });
  } catch (error) {
    console.error("Error fetching transaction totals:", error);
    res.status(500).json({ message: "Error fetching transaction totals" });
  }
});
let totalDebit = 0;
let totalCredit = 0;
let balance = 0;

// Dummy database update function for new transactions
const updateTotals = (transaction) => {
  if (transaction.type === "debit") {
    totalDebit += transaction.amount;
  } else {
    totalCredit += transaction.amount;
  }
  balance = totalCredit - totalDebit;
};

// Emit the updated totals on every new transaction
const broadcastTotals = () => {
  io.emit("transactionUpdate", {
    totalDebit,
    totalCredit,
    balance,
  });
};

// Endpoint to handle new transaction and update totals
app.post("/transaction", (req, res) => {
  const transaction = req.body; // { type: 'debit' or 'credit', amount: number }

  // Update totals based on transaction
  updateTotals(transaction);

  // Broadcast the updated totals
  broadcastTotals();

  res.status(200).json({ message: "Transaction added successfully" });
});

// Endpoint to get the current totals
app.get("/transaction/totals", (req, res) => {
  res.status(200).json({
    totalDebit,
    totalCredit,
    balance,
  });
});

// Socket connection handler
io.on("connection", (socket) => {
  console.log("New client connected");
  socket.emit("transactionUpdate", {
    totalDebit,
    totalCredit,
    balance,
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

/*app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Check if user exists
    const userResult = await pool.query(
      "SELECT * FROM login WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    // Verify role matches
    if (user.role !== role) {
      return res
        .status(400)
        .json({
          message: `Role mismatch. You selected ${role}, but this account is registered as ${user.role}.`,
        });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT or session
    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});*/
app.post("/logins", async (req, res) => {
  const { mobile_number, dob } = req.body;

  if (!mobile_number || !dob) {
    return res
      .status(400)
      .json({ error: "Mobile number and DOB are required" });
  }

  try {
    // Fetch the user data based on mobile number and DOB
    const result = await pool.query(
      "SELECT * FROM user_data WHERE mobile_number = $1 AND dob = $2",
      [mobile_number, dob]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0]; // Get the first user matching the query

      // Send back the user's data, including the name
      res.status(200).json({ message: "Login successful", user });
    } else {
      res.status(401).json({ error: "Invalid mobile number or DOB" });
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Example endpoint in Express.js
app.get("/user", async (req, res) => {
  const { mobile, dob } = req.query;
  // Query to find user by mobile and DOB
  const user = await db.query(
    "SELECT name FROM user_data WHERE mobile = $1 AND dob = $2",
    [mobile, dob]
  );

  if (user.rowCount > 0) {
    res.json({ name: user.rows[0].name });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

/*app.post('/logins', async (req, res) => {
  const { mobile_number, dob } = req.body;

  try {
    // Query to check if the user exists with the provided mobile number and DOB
    const result = await pool.query(
      'SELECT name FROM user_data WHERE mobile_number = $1 AND dob = $2',
      [mobile_number, dob]
    );

    // If a user is found, send back the user's name
    if (result.rows.length > 0) {
      res.json({ name: result.rows[0].name });
    } else {
      // If no user is found, send an error message
      res.status(401).json({ error: 'Invalid mobile number or date of birth' });
    }
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});*/
// Middleware to protect routes

app.get("/transaction", async (req, res) => {
  console.log("Request Body:", req.body);
  try {
    const transaction = await pool.query("SELECT * FROM login");
    res.json(transaction.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// Protected admin route

// Protected user route

// Add a new user
app.post("/user/add", async (req, res) => {
  const { name, mobile, dob } = req.body; // Include dob in the request body
  console.log("Received new user data:", req.body);

  try {
    const newUser = await pool.query(
      "INSERT INTO user_data (name, mobile_number, dob) VALUES($1, $2, $3) RETURNING *",
      [name, mobile, dob] // Pass dob to the query
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error("Error adding user", err.message);
    res.status(500).send("Server Error");
  }
});

// Add a new transaction
app.post("/transaction/add", async (req, res) => {
  const {
    amount,
    description,
    date,
    fromUserName,
    toUserName,
    transactionType,
  } = req.body;

  console.log("Received transaction data:", req.body);

  try {
    // Validate transaction type
    if (
      !transactionType ||
      (transactionType !== "debit" && transactionType !== "credit")
    ) {
      return res.status(400).send("Invalid transaction type");
    }

    // Ensure fromUserName or toUserName is provided
    if (transactionType === "debit" && !fromUserName) {
      return res.status(400).send("Debit transaction requires a fromUserName");
    }
    if (transactionType === "credit" && !toUserName) {
      return res.status(400).send("Credit transaction requires a toUserName");
    }

    // Insert the transaction with user names only (no user IDs)
    const newTransaction = await pool.query(
      "INSERT INTO transactions (amount, description, date, from_user_name, to_user_name) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [amount, description, date, fromUserName || null, toUserName || null]
    );

    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error("Error executing query", err.message);
    res.status(500).send("Server Error");
  }
});


app.get("/transactions", async (req, res) => {
  try {
    const transactions = await pool.query(`
      SELECT id, amount, description, date, from_user_name AS fromUserName, to_user_name AS toUserName
      FROM transactions
    `);

    res.json(transactions.rows);
  } catch (err) {
    console.error("Error fetching transactions", err.message);
    res.status(500).send("Server Error");
  }
});

// Get a list of all users
app.get("/user/list", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, mobile_number FROM user_data"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "An error occurred while fetching users" });
  }
});

// Get a list of all transactions
app.get("/transaction/list", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT t.id, t.date, t.amount, t.description, u1.name as from_user, u2.name as to_user FROM transactions t JOIN user_data u1 ON t.from_user = u1.id JOIN user_data u2 ON t.to_user = u2.id"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching transactions" });
  }
});

// Date-based queries for transactions
/*app.get("/transaction/date", async (req, res) => {
  const { date } = req.query;
  console.log("Received date:", date);

  if (!date) {
    return res.status(400).json({ error: "Date parameter is required" });
  }

  const formattedDate = new Date(date).toISOString().split("T")[0];
  console.log("Formatted date:", formattedDate);

  try {
    const result = await pool.query(
      `SELECT id, date, amount, description, from_user_name, to_user_name 
       FROM transactions 
       WHERE date = $1`,
      [formattedDate]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
*/
app.get("/transaction/date", async (req, res) => {
  const { date, name } = req.query; // Changed 'date' to 'dates'
  console.log("Received dates:", date, "and name:", name);

  if (!date) {
    return res.status(400).json({ error: "Dates parameter is required" }); // Updated error message
  }

  const formattedDate = new Date(date).toISOString().split("T")[0]; // Changed 'date' to 'dates'
  console.log("Formatted dates:", formattedDate);

  try {
    let query = `SELECT id, date, amount, description, from_user_name, to_user_name 
                 FROM transactions 
                 WHERE date = $1`;
    const queryParams = [formattedDate];

    // Add filtering by name if the name is provided
    if (name) {
      query += ` AND (from_user_name = $2 OR to_user_name = $2)`;
      queryParams.push(name);
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/transaction/names", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT from_user_name AS name 
       FROM transactions 
       UNION 
       SELECT DISTINCT to_user_name AS name 
       FROM transactions 
       WHERE from_user_name IS NOT NULL OR to_user_name IS NOT NULL`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching names:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Search transactions by name
app.get("/transaction/search", async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Name query parameter is required" });
  }

  try {
    const result = await pool.query(
      "SELECT t.id, t.date, t.amount, t.description, u1.name as from_user, u2.name as to_user FROM transactions t JOIN user_data u1 ON t.from_user = u1.id JOIN users u2 ON t.to_user = u2.id WHERE u1.name ILIKE $1 OR u2.name ILIKE $1 LIMIT 5",
      [`%${name}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching data:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/usertotal', async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'Name parameter is required' });
  }

  try {
    const query = `
      SELECT * 
      FROM transactions 
      WHERE from_user_name = $1 OR to_user_name = $1
    `;

    const result = await pool.query(query, [name]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Server listening on port 8080

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// to display all transactions//
/*app.get('/transaction', async (req, res) => {
  console.log('Request Body:', req.body);
  try {
    const transaction = await pool.query('SELECT * FROM transaction');
    res.json(transaction.rows);
    res.json(transaction.ro)
  } catch (err) {
    console.error(err.message);
  }
});
*/

/*app.get("/transaction", async (req, res) => {
  const { date, dropdown } = req.query;

  try {
    if (date) {
      // Handle filtering by date
      const result = await pool.query(
        "SELECT * FROM transaction WHERE date = $1",
        [date]
      );
      return res.json(result.rows);
    } else if (dropdown) {
      // Handle retrieving dropdown users
      const result = await pool.query(
        "SELECT id, name, mobile_number FROM transaction"
      );
      return res.json(result.rows);
    } else {
      // Default case: return all transactions
      const result = await pool.query("SELECT * FROM transaction");
      return res.json(result.rows);
    }
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});*/

/*const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const { Pool } = require('pg');

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "",
    database: "transactions_db"
});

/*app.post('/transaction', async (req, res) => {
  const { amount, description, name, mobile, date } = req.body;
  try {
    const newTransaction = await pool.query(
      "INSERT INTO transaction (amount, description, name, mobile_number, date) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [amount, description, name, mobile, date]
    );
    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});*

app.listen(8081, () => {
  console.log('Server is running on port 8081');
});
*/
/*const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const { Pool } = require('pg');

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "",
    database: "transactions_db"
});

app.post('/transaction', async (req, res) => {
  const { amount, description, name, mobile, date } = req.body;
  try {
    const newTransaction = await pool.query(
      "INSERT INTO transaction (amount, description, name, mobile_number, date) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [amount, description, name, mobile, date]
    );
    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
const newTransaction = await pool.query(
      "INSERT INTO transaction (amount, description, name, mobile_number, date) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [amount, description, name, mobile, date]
if (date) {
      query += ' WHERE date = $3';
      values.push(date);
    }

app.listen(8081, () => {
  console.log('Server is running on port 8081');
});*/
