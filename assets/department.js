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

const deleteDepartment = async (connection, departments) => {
  //drop a row
  let departmentList = await getList(
    connection,
    "department_name",
    "department"
  );
  console.log(managersList);
  let answers = await inquirer.prompt([
    {
      name: "delete",
      message: "Which Department are you Deleting?:",
      type: "list",
      choices: departmentList,
    },
    {
      name: "replace",
      message: "Which Department should employees be reassigned to?",
      type: "list",
      choices: departmentList.splice(delete -1, 1),
    },

    {
      name: "check",
      message: "are you sure?",
      type: "confirm",
    },
    {
      when: (answers) =>
        managersList.findIndex(
          (manager) => manager.value === answers.delete
        ) !== -1,
      name: "dblCheck",
      message:
        "deleting a department will delete all of their subordiates\nARE YOU SURE?",
      type: "confirm",
    },
  ]);
  if (answers.check) {
    if (answers.dblCheck) {
      connection.query(
        `Delete from employees where ?`,
        { manager_id: answers.delete },
        (err, rows) => {
          if (err) {
            console.log("You may not delete this employee");
          }
        }
      );
    }
    connection.query(
      `Delete from employees where ?`,
      { id: answers.delete },
      (err, rows) => {
        if (err) {
          console.log("You may not delete this employee");
        }
        console.log("Employee deleted");
        departments();
      }
    );
  } else {
    console.log("going back to main menu...");
    departments();
  }
};

module.exports = { viewDepartments, addDepartment, deleteDepartment };
