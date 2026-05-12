const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));

app.set("view engine", "ejs");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed");
    console.log(err);
  } else {
    console.log("Connected to Aiven MySQL");
  }
});

const createTable = `
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(50),
  full_name VARCHAR(100),
  course VARCHAR(100),
  year_level VARCHAR(20),
  email VARCHAR(100)
)
`;

db.query(createTable, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Students table ready");
  }
});

app.get("/", (req, res) => {
  db.query("SELECT * FROM students", (err, results) => {
    if (err) throw err;
    res.render("index", { students: results });
  });
});

app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", (req, res) => {
  const { student_id, full_name, course, year_level, email } = req.body;

  const sql = `
    INSERT INTO students 
    (student_id, full_name, course, year_level, email)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [student_id, full_name, course, year_level, email],
    (err) => {
      if (err) throw err;
      res.redirect("/");
    }
  );
});

app.get("/edit/:id", (req, res) => {
  db.query(
    "SELECT * FROM students WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) throw err;
      res.render("edit", { student: results[0] });
    }
  );
});


app.put("/edit/:id", (req, res) => {
  const { student_id, full_name, course, year_level, email } = req.body;

  const sql = `
    UPDATE students
    SET student_id=?, full_name=?, course=?, year_level=?, email=?
    WHERE id=?
  `;

  db.query(
    sql,
    [
      student_id,
      full_name,
      course,
      year_level,
      email,
      req.params.id
    ],
    (err) => {
      if (err) throw err;
      res.redirect("/");
    }
  );
});

app.delete("/delete/:id", (req, res) => {
  db.query(
    "DELETE FROM students WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) throw err;
      res.redirect("/");
    }
  );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/db", (req, res) => {
  db.query("SELECT * FROM students", (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});