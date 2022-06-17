const mysql = require('mysql2');

// connect to database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'employee_tracker',
        rowsAsArray: true
    },
    console.log('Connected to the employee_tracker database.')
);

module.exports = db;