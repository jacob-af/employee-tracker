const mysql = require("mysql-await");
const inquirer = require("inquirer");
const cTable = require("console.table");

const questions = require("./assets/questions.js");
const getList = require("./assets/getList.js");

const {
  viewEmployees,
  viewEmployeesByDepartment,
  viewEmployeesByManager,
  addEmployee,
  editEmployeeRole,
  editEmployeeManager,
  deleteEmployee,
} = require("./assets/employees.js");

const {
  viewRoles,
  addRole,
  deleteRole,
  editSalary,
} = require("./assets/roles.js");
const {
  viewDepartments,
  addDepartment,
  deleteDepartment,
} = require("./assets/department.js");
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "b00tcamp",
  database: "employee_db",
});

const viewDepartmentBudgetUsage = () => {
  connection.query(
    `SELECT 
            departments.id, departments.department_name, SUM(role.salary)
        FROM departments
        LEFT JOIN role ON departments.id = role.department_id
        GROUP BY departments.id`,
    (err, rows) => {
      if (err) throw err;
      console.log("Current Departments");
      console.table(rows);
      runPrompt();
    }
  );
};

const farewell = () => {
  connection.end();
  console.log("farewell");
};

const runPrompt = async () => {
  let answers = await inquirer.prompt(questions);
  switch (answers.action) {
    case "View, add, edit, or delete Employee":
      employees(answers.employees);
      break;
    case "View, add, edit, or delete Role":
      roles(answers.roles);
      break;
    case "View, add, edit, or delete Department":
      departments(answers.departments);
      break;
    case "View payroll total for each Department":
      viewDepartmentBudgetUsage();
      break;
    case "Exit":
      farewell();
      break;
    default:
      connection.end();
      console.log("how did you do that?");
      break;
  }
};

const employees = (choice) => {
  switch (choice) {
    case "View All Employees":
      viewEmployees(connection, employees);
      break;
    case "View All Employees By Department":
      viewEmployeesByDepartment(connection, employees);
      break;
    case "View All Employees By Manager":
      viewEmployeesByManager(connection, employees);
      break;
    case "Add Employee":
      addEmployee(connection, employees);
      break;
    case "Edit Employee Role":
      editEmployeeRole(connection, employees);
      break;
    case "Edit Employee Manager":
      editEmployeeManager(connection, employees);
      break;
    case "Delete Employee":
      deleteEmployee(connection, employees);
      break;
    case "Return to main menu":
    default:
      runPrompt();
      break;
  }
};

const departments = (choice) => {
  switch (choice) {
    case "View Departments":
      viewDepartments(connection, departments);
      break;
    case "Add Department":
      addDepartment(connection, departments);
      break;
    //case "Edit Department":
    case "Delete Department":
      deleteDepartment(connection, departments);
      break;
    case "Return to main menu":
    default:
      runPrompt();
      break;
  }
};

const roles = (choice) => {
  switch (choice) {
    case "View Roles":
      viewRoles(connection, roles);
      break;
    case "Add Role":
      addRole(connection, roles);
      break;
    // case 'Edit Role':
    case "Edit Salary":
      editSalary(connection, roles);
      break;
    case "Edit Department":
      editDepartment(connection, roles);
      break;
    case "Delete Role":
      deleteRole(connection, roles);
      break;
    case "Return to main menu":
    default:
      runPrompt();
      break;
  }
};

connection.connect((err) => {
  if (err) throw err;
  runPrompt();
});
