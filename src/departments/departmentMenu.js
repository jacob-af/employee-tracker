const inquirer = require("inquirer");

const {
  viewDepartments,
  addDepartment,
  deleteDepartment,
} = require("./departments.js");

const departmentMenu = async (runPrompt) => {
  let answer = await inquirer.prompt([
    {
      name: "departments",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "View Departments",
        "Add Department",
        "Delete Department",
        "Return to main menu",
      ],
    },
  ]);

  switch (answer.departments) {
    case "View Departments":
      viewDepartments(departmentMenu, runPrompt);
      break;
    case "Add Department":
      addDepartment(departmentMenu, runPrompt);
      break;
    //case "Edit Department":
    case "Delete Department":
      deleteDepartment(departmentMenu, runPrompt);
      break;
    case "Return to main menu":
    default:
      console.clear();
      runPrompt();
      break;
  }
};

module.exports = departmentMenu;
