// server.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'fintech_platform'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to database');
});

// Create database and tables
db.query(`
  CREATE DATABASE IF NOT EXISTS fintech_platform;
  USE fintech_platform;
  
  CREATE TABLE IF NOT EXISTS accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00
  );
  
  CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('deposit', 'withdrawal') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
  );
`, (err) => {
  if (err) {
    console.error('Error creating database and tables:', err);
    return;
  }
  console.log('Database and tables created successfully');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/transactions', (req, res) => {
  const { accountId, amount, type } = req.body;
  const query = `INSERT INTO transactions (account_id, amount, type) VALUES (?,?,?)`;
  db.query(query, [accountId, amount, type], (err, results) => {
    if (err) {
      console.error('Error inserting transaction:', err);
      res.status(500).send({ message: 'Error inserting transaction' });
    } else {
      res.send({ message: 'Transaction inserted successfully' });
    }
  });
});

app.get('/accounts', (req, res) => {
  const query = 'SELECT * FROM accounts';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching accounts:', err);
      res.status(500).send({ message: 'Error fetching accounts' });
    } else {
      res.send(results);
    }
  });
});

app.get('/transactions', (req, res) => {
  const query = 'SELECT * FROM transactions';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      res.status(500).send({ message: 'Error fetching transactions' });
    } else {
      res.send(results);
    }
  });
});

app.get('/account/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM accounts WHERE id =?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching account:', err);
      res.status(500).send({ message: 'Error fetching account' });
    } else {
      res.send(results[0]);
    }
  });
});

app.get('/transaction/:id', (req, res) => {
  const id = req.params.id;
  const query = 'SELECT * FROM transactions WHERE id =?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching transaction:', err);
      res.status(500).send({ message: 'Error fetching transaction' });
    } else {
      res.send(results[0]);
    }
  });
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});