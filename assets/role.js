const inquirer = require("inquirer");
const getList = require("./getList.js");

const viewRoles = (connection, roles) => {
  //return view role table
  connection.query(
    `SELECT 
              role.id, 
              role.title, 
              role.salary, 
              departments.department_name 
          FROM role 
          JOIN departments ON role.department_id = departments.id
          ORDER BY role.id ASC`,
    (err, rows) => {
      if (err) throw err;
      console.log("Current Roles");
      console.table(rows);
      roles();
    }
  );
};

const addRole = async (connection, roles) => {
  //code to add new role
  const titles = await getList(connection, "title", "role");
  const departments = await getList(
    connection,
    "department_name",
    "departments"
  );
  let answers = await inquirer.prompt([
    {
      type: "input",
      name: "newRole",
      message: "What is the name of the new role?: ",
      validate: function (newRole) {
        if (
          titles.findIndex((title) => title.name === newRole) !== -1 ||
          newRole === ""
        ) {
          console.log("\nthat role already exists");
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
  connection.query(
    "insert into role set ?",
    {
      title: answers.newRole,
      salary: answers.salary,
      department_id: answers.department,
    },
    (err) => {
      if (err) throw err;
      console.log("New Role Added");
      roles();
    }
  );
};

const deleteRole = async (connection, roles) => {
  const titles = await getList(connection, "title", "role");
};

module.exports = { viewRoles, addRole, deleteRole };
