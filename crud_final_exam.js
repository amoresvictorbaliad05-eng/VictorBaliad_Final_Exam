require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));

app.set("view engine", "ejs");


// ================= DATABASE =================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("Connected to Aiven MySQL");
});


// ================= TABLE =================
db.query(`
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(50),
  full_name VARCHAR(100),
  course VARCHAR(100),
  year_level VARCHAR(20),
  email VARCHAR(100)
)
`);


// ================= ROUTES =================

// HOME (DEFAULT)
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/students", (req, res) => {
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

  db.query(
    "INSERT INTO students VALUES (NULL,?,?,?,?,?)",
    [student_id, full_name, course, year_level, email],
    () => res.redirect("/students")
  );
});

app.get("/edit/:id", (req, res) => {
  db.query("SELECT * FROM students WHERE id=?", [req.params.id], (err, result) => {
    res.render("edit", { student: result[0] });
  });
});

app.put("/edit/:id", (req, res) => {
  const { student_id, full_name, course, year_level, email } = req.body;

  db.query(
    `UPDATE students SET student_id=?, full_name=?, course=?, year_level=?, email=? WHERE id=?`,
    [student_id, full_name, course, year_level, email, req.params.id],
    () => res.redirect("/students")
  );
});

app.delete("/delete/:id", (req, res) => {
  db.query("DELETE FROM students WHERE id=?", [req.params.id], () => {
    res.redirect("/students");
  });
});


// ================= SERVER =================
app.listen(3000, () => {
  console.log("Server running on port 3000");
});