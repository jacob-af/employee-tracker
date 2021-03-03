const inquirer = require("inquirer");
const getList = require("./getList.js");

const viewDepartments = (connection, departments) => {
  connection.query(
    `SELECT 
              *
          FROM departments`,
    (err, rows) => {
      if (err) throw err;
      console.log("Current Departments");
      console.table(rows);
      departments();
    }
  );
};

const addDepartment = async (connection, departments) => {
  //code to add new department
  const departmentsList = await getList(
    connection,
    "department_name",
    "departments"
  );
  let answers = await inquirer.prompt([
    {
      type: "input",
      name: "newDepartment",
      message: "What is the name of the new department?: ",
      validate: function (newDepartment) {
        if (
          departmentsList.findIndex(
            (department) => department.name === newDepartment
          ) !== -1 ||
          newDepartment === ""
        ) {
          console.log("\nthat department already exists");
          return false;
        } else {
          return true;
        }
      },
    },
  ]);
  connection.query(
    "insert into departments set ?",
    {
      department_name: answers.newDepartment,
    },
    (err) => {
      if (err) throw err;
      console.log("New Department Added");
      departments();
    }
  );
};

const matchedDepartments = (answers, current) => {
  console.log(answers, current);
  if (current == 1) {
    console.log(answers);
    console.log(
      "\nYou cannot reassign employees to a department you are deleting"
    );
    return false;
  } else {
    return true;
  }
};

const deleteDepartment = async (connection, departments) => {
  //drop a row
  let departmentList = await getList(
    connection,
    "department_name",
    "departments"
  );
  let answer1 = await inquirer.prompt([
    {
      name: "deleted",
      message: "Which Department are you Deleting?:",
      type: "list",
      choices: departmentList,
    },
  ]);
  console.log(parseInt(answer1.deleted) - 1);
  departmentList.splice(parseInt(answer1.deleted) - 1, 1);
  console.log(departmentList);
  let answers = await inquirer.prompt([
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
  if (answers.check) {
    connection.query(
      `UPDATE role set ? WHERE ?`,
      [{ department_id: answers.replace }, { department_id: answer1.deleted }],
      (err, rows) => {
        if (err) {
          console.log("Department could not be updated");
        }
        console.log("Employees' department update");
        connection.query(
          `Delete from departments where ?`,
          { id: answer1.deleted },
          (err, rows) => {
            if (err) {
              console.log("This department could not be deleted");
            }
            console.log("Department deleted");
            departments();
          }
        );
      }
    );
  } else {
    console.log("going back to main menu...");
    departments();
  }
};

module.exports = { viewDepartments, addDepartment, deleteDepartment };
