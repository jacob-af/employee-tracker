const inquirer = require("inquirer");
const getList = require("./getList.js");
const connection = require("./connection.js");

const mainQuery = `SELECT 
    employees.id, 
    employees.first_name AS 'First Name', 
    employees.last_name AS 'Last Name', 
    role.title as Title, 
    role.salary AS Salary, 
    departments.department_name AS Department, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS Manager 
FROM employees 
    JOIN role ON employees.role_id = role.id 
    JOIN departments ON role.department_id = departments.id 
    LEFT JOIN employees AS manager ON employees.manager_id = manager.id`;

const viewEmployees = async (employees) => {
  const rows = await connection.awaitQuery(mainQuery);
  console.log("All Employees");
  console.table(rows);
  employees();
};

const viewEmployeesByDepartment = async (employees) => {
  //return view department table
  let departmentList = await getList("department_name", "departments");
  departmentList = ["All", ...departmentList];
  let answers = await inquirer.prompt([
    {
      type: "list",
      name: "chooseDepartment",
      message: "Which department would you like to view?: ",
      choices: departmentList,
    },
  ]);
  if (answers.chooseDepartment === "All") {
    let rows = await connection.awaitQuery(`${mainQuery} ORDER BY Department`);
    console.log("All Employees");
    console.table(rows);
    employees();
  } else {
    let rows = await connection.awaitQuery(`${mainQuery} WHERE ?`, {
      "departments.id": answers.chooseDepartment,
    });
    console.log(
      `Employees in the ${departmentList[answers.chooseDepartment]} Department`
    );
    console.table(rows);
    employees();
  }
};

const viewEmployeesByManager = async (employees) => {
  // view employee by manager
  let managerList = await getList(
    "CONCAT(first_name, ' ', last_name)",
    "employees where manager_id is NULL"
  );
  managerList = ["{ name: 'No Manager', value: 0 }", ...managerList];

  let answers = await inquirer.prompt([
    {
      type: "list",
      name: "chooseManager",
      message: "Which manager's team would you like to view?: ",
      choices: managerList,
    },
  ]);
  if (answers.chooseManager === 0) {
    let rows = await connection.awaitQuery(
      `SELECT * FROM
      (${mainQuery}) AS temp
      WHERE Manager is Null`
    );
    console.log("Employees with no manager");
    console.table(rows);
    employees();
  } else {
    let rows = await connection.queryAwait(
      `SELECT * FROM
        (${mainQuery}) AS temp
        WHERE ?`,
      { id: answers.chooseManager }
    );
    console.log(`Employees managed by ${answers.chooseManager}`);
    console.table(rows);
    employees();
  }
};

const addEmployee = async (employees) => {
  const roleList = await getList("title", "role");
  let managerList = await getList(
    "CONCAT(first_name, ' ', last_name)",
    "employees where manager_id is NULL"
  );
  managerList = [{ name: "none", value: 0 }, ...managerList];

  let answers = await inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "Enter new employee's first name",
    },
    {
      name: "lastName",
      message: "Enter new employee's last name",
      type: "input",
    },
    {
      name: "role",
      message: "select employee role:",
      type: "list",
      choices: roleList,
    },

    {
      name: "manager",
      message: "select employee manager:",
      type: "list",
      choices: managerList,
    },
  ]);
  if (answers.manager !== 0) {
    connection.query(
      "insert into employees set ?",
      {
        first_name: answers.firstName,
        last_name: answers.lastName,
        role_id: answers.role,
        manager_id: answers.manager,
      },
      (err) => {
        if (err) throw err;
        console.log("employee added");
        employees();
      }
    );
  } else {
    connection.query(
      "insert into employees set ?",
      {
        first_name: answers.firstName,
        last_name: answers.lastName,
        role_id: answers.role,
      },
      (err) => {
        if (err) throw err;
        console.log("employee added");
        employees();
      }
    );
  }
};

const editEmployeeRole = async (employees) => {
  let employeeList = await getList(
    "CONCAT(first_name, ' ', last_name)",
    "employees"
  );
  let rolesList = await getList("title", "role");
  let answers = await inquirer.prompt([
    {
      name: "alter",
      message: "Which Employee are you reassigning to a new role?:",
      type: "list",
      choices: employeeList,
    },
    {
      name: "role",
      message: "What is their new role?:",
      type: "list",
      choices: rolesList,
    },
  ]);
  connection.awaitQuery(`UPDATE employees set ? WHERE ?`, [
    { role_id: answers.role },
    { id: answers.alter },
  ]);
  console.log("Role updated");
  employees();
};

const editEmployeeManager = async (employees) => {
  let employeeList = await getList(
    "CONCAT(first_name, ' ', last_name)",
    "employees"
  );
  let managersList = await getList(
    "CONCAT(first_name, ' ', last_name)",
    "employees where manager_id is Null"
  );
  let answers = await inquirer.prompt([
    {
      name: "alter",
      message: "Which Employee are you reassigning to a new manager?:",
      type: "list",
      choices: employeeList,
    },
    {
      name: "manager",
      message: "Who will the new manager be?:",
      type: "list",
      choices: managersList,
    },
  ]);
  connection.awaitQuery(`UPDATE employees set ? WHERE ?`, [
    { manager_id: answers.manager },
    { id: answers.alter },
  ]);
  console.log("Manager updated");
  employees();
};

const deleteEmployee = async (employees) => {
  let employeeList = await getList(
    connection,
    "CONCAT(first_name, ' ', last_name)",
    "employees"
  );
  let managersList = await getList(
    connection,
    "manager_id",
    "employees where manager_id is Null"
  );
  console.log(managersList);
  let answers = await inquirer.prompt([
    {
      name: "delete",
      message: "Which Employee are you Deleting?:",
      type: "list",
      choices: employeeList,
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
        "deleting a manager will delete all of their subordiates\nARE YOU SURE?",
      type: "confirm",
    },
  ]);
  if (answers.check) {
    if (answers.dblCheck) {
      connection.awaitQuery(`Delete from employees where ?`, {
        manager_id: answers.delete,
      });
    }
    connection.awaitQuery(`Delete from employees where ?`, {
      id: answers.delete,
    });
    console.log("Employee deleted");
    employees();
  } else {
    console.log("going back to main menu...");
    employees();
  }
};

module.exports = {
  viewEmployees,
  viewEmployeesByDepartment,
  viewEmployeesByManager,
  addEmployee,
  editEmployeeRole,
  editEmployeeManager,
  deleteEmployee,
};
