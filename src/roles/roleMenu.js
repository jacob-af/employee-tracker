const inquirer = require("inquirer");

const {
  viewRoles,
  addRole,
  deleteRole,
  editSalary,
  editDepartment,
} = require("./roles.js");

const roleMenu = async (runPrompt) => {
  let answer = await inquirer.prompt([
    {
      name: "roles",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "View Roles",
        "Add Role",
        "Edit Salary",
        "Edit Department",
        "Delete Role",
        "Return to main menu",
      ],
    },
  ]);
  switch (answer.roles) {
    case "View Roles":
      viewRoles(roleMenu, runPrompt);
      break;
    case "Add Role":
      addRole(roleMenu, runPrompt);
      break;
    // case 'Edit Role':
    case "Edit Salary":
      editSalary(roleMenu, runPrompt);
      break;
    case "Edit Department":
      editDepartment(roleMenu, runPrompt);
      break;
    case "Delete Role":
      deleteRole(roleMenu, runPrompt);
      break;
    case "Return to main menu":
    default:
      console.clear();
      runPrompt();
      break;
  }
};

module.exports = roleMenu;
