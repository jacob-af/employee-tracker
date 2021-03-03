const inquirer = require("inquirer");
const getList = require("../getList.js");
const connection = require("../connection.js");

const viewRoles = async (roleMenu, runPrompt) => {
  //return view role table
  let rows = await connection.awaitQuery(
    `SELECT 
        roles.id, 
        roles.title, 
        roles.salary, 
        departments.department_name 
    FROM roles 
    JOIN departments ON roles.department_id = departments.id
    ORDER BY roles.id ASC`
  );
  console.log("Current Roles");
  console.table(rows);
  roleMenu(runPrompt);
};

const addRole = async (roleMenu, runPrompt) => {
  //code to add new role
  const titles = await getList("title", "roles");
  const departments = await getList("department_name", "departments");
  let answers = await inquirer.prompt([
    {
      type: "input",
      name: "newRole",
      message: "What is the name of the new role?: ",
      validate: function (newRole) {
        if (titles.findIndex((title) => title.name === newRole) !== -1) {
          console.log("\nthat role already exists");
          return false;
        } else if (newRole === "") {
          console.log("\nNew role must have a name!");
          return false;
        } else {
          return true;
        }
      },
    },
    {
      type: "number",
      name: "salary",
      message: "How much will this role be paid? ",
    },
    {
      type: "list",
      name: "department",
      message: "Which department will they be working in?",
      choices: departments,
    },
  ]);
  connection.awaitQuery("insert into roles set ?", {
    title: answers.newRole,
    salary: answers.salary,
    department_id: answers.department,
  });
  console.clear();
  console.log("New Role Added");
  roleMenu(runPrompt);
};

const editSalary = async (roleMenu, runPrompt) => {
  let roleList = await getList("title", "roles");
  let answers = await inquirer.prompt([
    {
      name: "role",
      message: "Which role are you changing the salary of?:",
      type: "list",
      choices: roleList,
    },
    {
      type: "number",
      name: "salary",
      message: "what is the new salary?",
    },
  ]);
  connection.awaitQuery(`UPDATE roles SET ? WHERE ?`, [
    { salary: answers.salary },
    { id: answers.role },
  ]);
  console.clear();
  console.log("Salary has been updated");
  roleMenu(runPrompt);
};

const editDepartment = async (roleMenu, runPrompt) => {
  let departmentList = await getList("department_name", "departments");
  let roleList = await getList("title", "roles");
  let answers = await inquirer.prompt([
    {
      name: "role",
      message: "Which role are you changing the department of?:",
      type: "list",
      choices: roleList,
    },
    {
      name: "department",
      message: "Select new department:",
      type: "list",
      choices: departmentList,
    },
  ]);
  connection.awaitQuery(`UPDATE roles SET ? WHERE ?`, [
    { department_id: answers.department },
    { id: answers.role },
  ]);
  console.clear();
  console.log("Department has been changed");
  roleMenu(runPrompt);
};

const deleteRole = async (roleMenu, runPrompt) => {
  //drop a row
  let roleList = await getList("title", "roles");
  let answer1 = await inquirer.prompt([
    {
      name: "deleted",
      message: "Which role are you deleting?:",
      type: "list",
      choices: roleList,
    },
  ]);
  roleList.splice(answer1.deleted - 1, 1);
  let answer2 = await inquirer.prompt([
    {
      name: "replace",
      message: "Which role should employees be reassigned to?",
      type: "list",
      choices: roleList,
    },
    {
      name: "check",
      message: "are you sure?",
      type: "confirm",
    },
  ]);
  console.clear();
  if (answer2.check) {
    connection.awaitQuery(`UPDATE employees SET ? WHERE ?`, [
      { role_id: answer2.replace },
      { role_id: answer1.deleted },
    ]);
    console.log("Employees' roles update");
    connection.awaitQuery(`Delete from role where ?`, { id: answer1.deleted });
    console.log("Role deleted");
  } else {
    console.log("going back to menu...");
  }
  roleMenu(runPrompt);
};

module.exports = { viewRoles, addRole, deleteRole, editSalary, editDepartment };
