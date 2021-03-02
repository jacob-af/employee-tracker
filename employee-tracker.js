const mysql = require('mysql');
const inquirer = require('inquirer')
const cTable = require('console.table')

const questions = require("./assets/questions.js");
const PasswordPrompt = require('inquirer/lib/prompts/password');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'b00tcamp',
    database: 'employee_db',
  });


const addDepartment = (data) => {
    //code to add new department
}

const addEmployee = data => {
    //code to add new employee
}

const addRole = (data) => {
    //code to add new role
}

const viewDepartment = () => {
    //return view department table
}

const viewRoles = () => {
    //return view role table
}

const viewEmployees = () => {
    connection.query('select * from employees', (err, rows) => {
        if (err) throw err;
        console.table(rows)
        return runPrompt();
    })

}

const updateManager = (data) => {

}

const viewEmployeesByManager = () => {
    // view employee by manager
}

const deleteDepartment = (data) => {
    //drop a row
}

const deleteRole = (data) => {}

const deleteEmployee = (data) => {}

const viewDepartmentBudgetUsage = (data) => {

}

const runPrompt = async () => {
    let answers = await inquirer.prompt(questions)
    //switch-case for answers
    switch (answers.action) {
        case 'View All Employees':
            return viewEmployees();
        case 'View All Employees by department':
            viewDepartment();
        case 'View all employees by manager':
            viewManager();
        case 'Add Employee':
            addEmployee();
        case 'Remove Employee':
            deleteEmployee();
        case 'Update Employee Role':
            return;
        case 'Update Employee Manager':
            return;
        case 'Remove Role':
            return;
        case 'Remove Department':
            return;
        case 'Exit':
            console.log('Farewell!')
            break;
        default:
            console.log("how did you do that?")
    }
}

runPrompt()