const inquirer = require("inquirer");
const cTable = require("console.table");

const connection = require("./src/connection.js");
const questions = require("./src/questions.js");

const {
  viewEmployees,
  viewEmployeesByDepartment,
  viewEmployeesByManager,
  addEmployee,
  editEmployeeRole,
  editEmployeeManager,
  deleteEmployee,
} = require("./src/employees.js");

const {
  viewRoles,
  addRole,
  deleteRole,
  editSalary,
  editDepartment,
} = require("./src/roles.js");

const {
  viewDepartments,
  addDepartment,
  deleteDepartment,
} = require("./src/department.js");

const viewDepartmentBudgetUsage = async () => {
  let rows = await connection.awaitQuery(
    `SELECT 
            departments.id, departments.department_name, SUM(role.salary)
      FROM departments
      LEFT JOIN role ON departments.id = role.department_id
      GROUP BY departments.id`
  );
  console.log("Current Departments");
  console.table(rows);
  runPrompt();
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
      viewEmployees(employees);
      break;
    case "View All Employees By Department":
      viewEmployeesByDepartment(employees);
      break;
    case "View All Employees By Manager":
      viewEmployeesByManager(employees);
      break;
    case "Add Employee":
      addEmployee(employees);
      break;
    case "Edit Employee Role":
      editEmployeeRole(employees);
      break;
    case "Edit Employee Manager":
      editEmployeeManager(employees);
      break;
    case "Delete Employee":
      deleteEmployee(employees);
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
      viewDepartments(departments);
      break;
    case "Add Department":
      addDepartment(departments);
      break;
    //case "Edit Department":
    case "Delete Department":
      deleteDepartment(departments);
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
      viewRoles(roles);
      break;
    case "Add Role":
      addRole(roles);
      break;
    // case 'Edit Role':
    case "Edit Salary":
      editSalary(roles);
      break;
    case "Edit Department":
      editDepartment(roles);
      break;
    case "Delete Role":
      deleteRole(roles);
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
