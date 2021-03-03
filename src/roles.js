const inquirer = require("inquirer");
const getList = require("./getList.js");
const connection = require("./connection.js");

const viewRoles = async (roles) => {
  //return view role table
  let rows = await connection.awaitQuery(
    `SELECT 
        role.id, 
        role.title, 
        role.salary, 
        departments.department_name 
    FROM role 
    JOIN departments ON role.department_id = departments.id
    ORDER BY role.id ASC`
  );
  console.log("Current Roles");
  console.table(rows);
  roles();
};

const addRole = async (roles) => {
  //code to add new role
  const titles = await getList("title", "role");
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
  connection.awaitQuery("insert into role set ?", {
    title: answers.newRole,
    salary: answers.salary,
    department_id: answers.department,
  });
  console.log("New Role Added");
  roles();
};

const editSalary = async (roles) => {
  let roleList = await getList("title", "role");
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
  connection.awaitQuery(`UPDATE role SET ? WHERE ?`, [
    { salary: answers.salary },
    { id: answers.role },
  ]);
  roles();
};

const editDepartment = async (roles) => {
  let departmentList = await getList("department_name", "departments");
  let roleList = await getList("title", "role");
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
  connection.awaitQuery(`UPDATE role SET ? WHERE ?`, [
    { department_id: answers.department },
    { id: answers.role },
  ]);
  roles();
};

const deleteRole = async (roles) => {
  //drop a row
  let roleList = await getList("title", "role");
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
  if (answer2.check) {
    connection.awaitQuery(`UPDATE employees set ? WHERE ?`, [
      { role_id: answer2.replace },
      { role_id: answer1.deleted },
    ]);
    console.log("Employees' roles update");
    connection.query(`Delete from role where ?`, { id: answer1.deleted });
    console.log("Role deleted");
    roles();
  } else {
    console.log("going back to menu...");
    roles();
  }
};

module.exports = { viewRoles, addRole, deleteRole, editSalary, editDepartment };
