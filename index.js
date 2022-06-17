const db = require('./db/connection');
const cTable = require('console.table');
const inquirer = require('inquirer');

// prompts user for initial instructions then sends to appropriate function
const userPrompt = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit']
        }
    ])
    .then((choice) => {
        switch(choice.action) {
            case 'View All Employees':
                console.log('\n');
                viewAllEmployees();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Update Employee Role':
                updateEmployeeRole();
                break;
            case 'View All Roles':
                console.log('\n');
                viewAllRoles();
                break;
            case 'Add Role':
                addRole();
                break;
            case 'View All Departments':
                console.log('\n');
                viewAllDepartments();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Quit':
                console.log('Goodbye.')
                process.exit(1);

        };
    });
};

// displays all the departments
const viewAllDepartments = function() {
    db.query(`SELECT * FROM department`, (err, result) => {
        console.table(['ID', 'Name'], result);
        userPrompt();
    });
};

// displays all the roles and their data
const viewAllRoles = function() {
    const sql = `SELECT role.id, role.title, role.salary, department.name 
                FROM role
                LEFT JOIN department ON role.department_id = department.id`;

    db.query(sql, (err, result) => {
        console.table(['ID', 'Title', 'Salary', 'Department'], result);
        userPrompt();
    });
};

// displays all the employees with each their respective data sets
const viewAllEmployees = function() {
    const sql = `SELECT employee.id, 
                    employee.first_name, 
                    employee.last_name, 
                    role.title AS title, 
                    department.name AS department,
                    role.salary, 
                    CONCAT (manager.first_name, ' ', manager.last_name) AS manager  
                FROM employee 
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee manager ON employee.manager_id = manager.id`
    db.query(sql, (err, result) => {
        console.table(['ID', 'First Name', 'Last Name', 'Title', 'Department', 'Salary', 'Manager'], result);
        userPrompt();
    });
};

// adds an employee into the database
const addEmployee = function() {
    inquirer.prompt([
    {
        type: 'input',
        name: 'first',
        message: "What is the employee's first name?",
        validate: Input => {
            if (Input) {
                return true;
            } else {
                console.log("Please enter the employee's first name!")
            }
        }
    },
    {
        type: 'input',
        name: 'last',
        message: "What is the employee's last name?",
        validate: Input => {
            if (Input) {
                return true;
            } else {
                console.log("Please enter the employee's last name!")
            }
        }
    }
    ])
    // creates array with first and last name
    .then(data => {
        // creates array to store user data
        const params = [data.first, data.last];
        
        // grabs roles then sorts them into choices for inquirer prompt
        const sql = `SELECT role.id, role.title FROM role`;
        db.query(sql, (err, result) => {
            if (err) {throw err};
            // takes data recieved and sorts it into array and gives a value of the id
            const roles = result.map(([ id, title ]) => ({ name: title, value: id }));
        
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: "What is the employee's role?",
                    choices: roles
                }
            ])
            .then(data => {
                // pushes employee role into params
                params.push(data.role);
        
                // gets employee names and id to choose a manager
                const sql = `SELECT employee.id, CONCAT (employee.first_name, ' ', employee.last_name) AS employee FROM employee`
                db.query(sql, (err, result) => {
                    if (err) {throw err};
        
                    const managers = result.map(([ id, employee ]) => ({ name: employee, value: id }));
                    const none = {name: 'None', value: null};
                    managers.push(none);
        
                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message: "Who is the employee's manager?",
                            choices: managers
                        }
                    ])
                    .then(data => {
                        params.push(data.manager);
        
                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;
                        db.query(sql, params, (err, results) => {
                            if (err) {throw err};
                            console.log('Employee successfully added!');
        
                            userPrompt();
                        });
                    });
                });
            });
        });
    });
};

// creates another role in the database
const addRole = function() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the role?',
            validate: input => {
                if (!input) {
                    console.log('Please enter the name of the role!')
                    return false;
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary of the role?',
            validate: input => {
                if (!input) {
                    console.log('Please enter the salary of the role!')
                    return false;
                }
                return true;
            }
        }
    ])
    .then(data => {
        const params = [data.name, data.salary];

        const sql = `SELECT department.id, department.name FROM department`;
        db.query(sql, (err, result) => {
            if (err) {throw err};

            const departments = result.map(([ id, name ]) => ({ name: name, value: id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'department',
                    message: 'Which department does the role belong to?',
                    choices: departments
                }
            ])
            .then(data => {
                params.push(data.department);

                const sql = `INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`;
                db.query(sql, params, (err, result) => {
                    if (err) {throw err};

                    console.log(`Added role into the database!`);

                    userPrompt();
                })
            })
        })
    })
};

// creates another department in the database
const addDepartment = function() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'What is the name of the department?',
            validate: data => {
                if (!data) {
                    console.log('Please enter name of the department!');
                    return false;
                }
                return true;
            }
        }
    ])
    .then(input => {
        const sql = `INSERT INTO department (name) VALUES (?)`;
        const param = input.department;
        db.query(sql, param, (err, result) => {
            if (err) throw err;

            console.log(`Added department into the database!`);
            userPrompt();
        });
    });
};

// changes an employee's role
const updateEmployeeRole = function() {
    const sql = `SELECT employee.id, CONCAT (employee.first_name, ' ', employee.last_name) AS employee FROM employee`;
    db.query(sql, (err, results) => {
        if (err) throw err;

        const employees = results.map(([ id, employee ]) => ({ name: employee, value: id }));
        inquirer.prompt([
            {
                type: 'list',
                name: 'employee',
                message: "Which employee would you like to update?",
                choices: employees
            }
        ])
        .then(data => {
            const id = data.employee;
            const sql = `SELECT role.id, role.title FROM role`;
            db.query(sql, (err, result) => {
                if (err) throw err;
                const roles = result.map(([ id, title ]) => ({ name: title, value: id }));

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'role',
                        message: "What is the employee's new role?",
                        choices: roles
                    }
                ])
                .then(data => {
                    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
                    const param = [data.role, id];
                    db.query(sql, param, (err, result) => {
                        if (err) throw err;

                        console.log("Employee role successfully updated!");
                        userPrompt();
                    });
                });
            });
        });
    });
};

userPrompt();