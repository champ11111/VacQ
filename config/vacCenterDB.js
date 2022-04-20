const mysql = require("mysql");

var connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: "vacCenter",
});

module.exports = connection;
