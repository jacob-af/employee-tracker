const inquirer = require("inquirer");

const {
  viewEmployees,
  viewEmployeesByDepartment,
  viewEmployeesByManager,
  addEmployee,
  editEmployeeRole,
  editEmployeeManager,
  deleteEmployee,
} = require("./employees.js");

const employeeMenu = async (runPrompt) => {
  let answer = await inquirer.prompt([
    {
      name: "employees",
      type: "rawlist",
      message: "View, add, edit, and delete employees\nSelect an option",
      choices: [
        "View All Employees",
        "View All Employees By Department",
        "View All Employees By Manager",
        "Add Employee",
        "Edit Employee Role",
        "Edit Employee Manager",
        "Delete Employee",
        "Return to main menu",
      ],
    },
  ]);
  switch (answer.employees) {
    case "View All Employees":
      viewEmployees(employeeMenu, runPrompt);
      break;
    case "View All Employees By Department":
      viewEmployeesByDepartment(employeeMenu, runPrompt);
      break;
    case "View All Employees By Manager":
      viewEmployeesByManager(employeeMenu, runPrompt);
      break;
    case "Add Employee":
      addEmployee(employeeMenu, runPrompt);
      break;
    case "Edit Employee Role":
      editEmployeeRole(employeeMenu, runPrompt);
      break;
    case "Edit Employee Manager":
      editEmployeeManager(employeeMenu, runPrompt);
      break;
    case "Delete Employee":
      deleteEmployee(employeeMenu, runPrompt);
      break;
    case "Return to main menu":
    default:
      runPrompt();
      break;
  }
};

module.exports = employeeMenu;
