const mysql = require("mysql-await");

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "b00tcamp",
  database: "employee_db",
});

module.exports = connection;
