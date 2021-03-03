const inquirer = require("inquirer");
const getList = require("./getList.js");
const connection = require("./connection.js");

const viewDepartments = async (departments) => {
  let rows = await connection.awaitQuery(`SELECT * FROM departments`);
  console.log("Current Departments");
  console.table(rows);
  departments();
};

const addDepartment = async (departments) => {
  //code to add new department
  const departmentsList = await getList("department_name", "departments");
  let answers = await inquirer.prompt([
    {
      type: "input",
      name: "newDepartment",
      message: "What is the name of the new department?: ",
      validate: function (newDepartment) {
        if (
          departmentsList.findIndex(
            (department) => department.name === newDepartment
          ) !== -1
        ) {
          console.log("\nthat department already exists");
          return false;
        } else if (newDepartment === "") {
          console.log("\nDepartment must have a name!");
          return false;
        } else {
          return true;
        }
      },
    },
  ]);
  connection.awaitQuery("insert into departments set ?", {
    department_name: answers.newDepartment,
  });
  console.log("New Department Added");
  departments();
};

const deleteDepartment = async (departments) => {
  //drop a row
  let departmentList = await getList("department_name", "departments");
  let answer1 = await inquirer.prompt([
    {
      name: "deleted",
      message: "Which Department are you Deleting?:",
      type: "list",
      choices: departmentList,
    },
  ]);
  departmentList.splice(parseInt(answer1.deleted) - 1, 1);
  let answer2 = await inquirer.prompt([
    {
      name: "replace",
      message: "Which Department should employees be reassigned to?",
      type: "list",
      choices: departmentList,
    },
    {
      name: "check",
      message: "are you sure?",
      type: "confirm",
    },
  ]);
  if (answer2.check) {
    connection.awaitQuery(`UPDATE role set ? WHERE ?`, [
      { department_id: answer2.replace },
      { department_id: answer1.deleted },
    ]);
    console.log("Employees' department update");
    connection.awaitQuery(`Delete from departments where ?`, {
      id: answer1.deleted,
    });
    console.log("Department deleted");
    departments();
  } else {
    console.log("going back to main menu...");
    departments();
  }
};

module.exports = { viewDepartments, addDepartment, deleteDepartment };
