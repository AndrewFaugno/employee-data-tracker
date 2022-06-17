const db = require('./db/connection');
const inquirer = require('inquirer');
const cTable = require('console.table');


const initialPrompt = function() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: ['View All Employees']
        }
    ])
}