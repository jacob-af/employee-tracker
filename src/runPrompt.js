const inquirer = require("inquirer");
const employeeMenu = require("./employees/employeeMenu");
const roleMenu = require("./roles/roleMenu");
const departmentMenu = require("./departments/departmentMenu");
const connection = require("./connection.js");

const runPrompt = async () => {
  let answers = await inquirer.prompt([
    {
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "View, add, edit, or delete Employee",
        "View, add, edit, or delete Role",
        "View, add, edit, or delete Department",
        "View payroll total for each Department",
        "Exit",
      ],
    },
  ]);
  switch (answers.action) {
    case "View, add, edit, or delete Employee":
      employeeMenu(runPrompt);
      break;
    case "View, add, edit, or delete Role":
      roleMenu(runPrompt);
      break;
    case "View, add, edit, or delete Department":
      departmentMenu(runPrompt);
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

const viewDepartmentBudgetUsage = async () => {
  let rows = await connection.awaitQuery(
    `SELECT 
              departments.id, 
              departments.department_name as 'Department Name', 
              SUM(role.salary) AS Budget
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

module.exports = runPrompt;
