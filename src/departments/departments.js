const inquirer = require("inquirer");
const getList = require("../getList.js");
const connection = require("../connection.js");

const viewDepartments = async (departmentMenu, runPrompt) => {
  try {
    let rows = await connection.awaitQuery(`SELECT * FROM departments`);
    console.clear();
    console.log("Current Departments");
    console.table(rows);
  } catch (error) {
    console.error(`***** ${error.sqlMessage} *****`);
  }
  departmentMenu(runPrompt);
};

const addDepartment = async (departmentMenu, runPrompt) => {
  //code to add new department
  try {
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
    console.clear();
    console.log("New Department Added");
  } catch (error) {
    console.error(`***** ${error.sqlMessage} *****`);
  }
  departmentMenu(runPrompt);
};

const deleteDepartment = async (departmentMenu, runPrompt) => {
  //drop a row
  try {
    let departmentList = await getList("department_name", "departments");
    let answer1 = await inquirer.prompt([
      {
        name: "delete",
        message: "Which Department are you Deleting?:",
        type: "list",
        choices: departmentList,
      },
    ]);
    let departmentIndex = departmentList.findIndex(
      (department) => department.value === answer1.delete
    );
    departmentList.splice(departmentIndex, 1);
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
    console.clear();
    if (answer2.check) {
      connection.awaitQuery(`UPDATE roles set ? WHERE ?`, [
        { department_id: answer2.replace },
        { department_id: answer1.delete },
      ]);
      console.log("Employees' department update");
      connection.awaitQuery(`Delete from departments where ?`, {
        id: answer1.delete,
      });
      console.log("Department deleted");
    } else {
      console.log("going back to main menu...");
    }
  } catch (error) {
    console.error(`***** ${error.sqlMessage} *****`);
  }
  departmentMenu(runPrompt);
};

module.exports = { viewDepartments, addDepartment, deleteDepartment };
