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

const editSalary = async (connection, roles) => {
  let roleList = await getList(connection, "title", "role");
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
  connection.query(
    `UPDATE role SET ? WHERE ?`,
    [{ salary: answers.salary }, { id: answers.role }],
    (err, rows) => {
      if (err) {
        console.log("Role could not be updated");
      }
      roles();
    }
  );
};

const deleteRole = async (connection, roles) => {
  //drop a row
  let roleList = await getList(connection, "title", "role");
  let answer1 = await inquirer.prompt([
    {
      name: "deleted",
      message: "Which role are you deleting?:",
      type: "list",
      choices: roleList,
    },
  ]);
  roleList.splice(parseInt(answer1.deleted) - 1, 1);
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
    connection.query(
      `UPDATE employees set ? WHERE ?`,
      [{ role_id: answer2.replace }, { role_id: answer1.deleted }],
      (err, rows) => {
        if (err) {
          console.log("Role could not be updated");
        }
        console.log("Employees' roles update");
        connection.query(
          `Delete from role where ?`,
          { id: answer1.deleted },
          (err, rows) => {
            if (err) {
              console.log("This role could not be deleted");
            }
            console.log("Role deleted");
            roles();
          }
        );
      }
    );
  } else {
    console.log("going back to main menu...");
    roles();
  }
};

module.exports = { viewRoles, addRole, deleteRole, editSalary };
