const inquirer = require("inquirer");
const getList = require("../getList.js");
const connection = require("../connection.js");

const mainQuery = `SELECT 
    employees.id, 
    employees.first_name AS 'First Name', 
    employees.last_name AS 'Last Name', 
    roles.title as Title, 
    roles.salary AS Salary, 
    departments.department_name AS Department, 
    CONCAT(manager.first_name, ' ', manager.last_name) AS Manager 
FROM employees 
    JOIN roles ON employees.role_id = roles.id 
    JOIN departments ON roles.department_id = departments.id 
    LEFT JOIN employees AS manager ON employees.manager_id = manager.id`;

const viewEmployees = async (employees, runPrompt) => {
  const rows = await connection.awaitQuery(
    `${mainQuery} ORDER BY employees.id ASC`
  );
  console.clear();
  console.log("All Employees");
  console.table(rows);
  employees(runPrompt);
};

const viewEmployeesByDepartment = async (employees, runPrompt) => {
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
  console.clear();
  if (answers.chooseDepartment === "All") {
    let rows = await connection.awaitQuery(`${mainQuery} ORDER BY Department`);
    console.log("All Employees");
    console.table(rows);
    employees(runPrompt);
  } else {
    let rows = await connection.awaitQuery(`${mainQuery} WHERE ?`, {
      "departments.id": answers.chooseDepartment,
    });
    console.log(
      `Employees in the ${departmentList[answers.chooseDepartment]} Department`
    );
    console.table(rows);
    employees(runPrompt);
  }
};

const viewEmployeesByManager = async (employees, runPrompt) => {
  // view employee by manager
  let managerList = await getList(
    "CONCAT(first_name, ' ', last_name)",
    "employees where manager_id is NULL"
  );
  managerList = [{ name: "No Manager", value: 0 }, ...managerList];

  let answers = await inquirer.prompt([
    {
      type: "list",
      name: "chooseManager",
      message: "Which manager's team would you like to view?: ",
      choices: managerList,
    },
  ]);
  console.clear();
  if (answers.chooseManager === 0) {
    let rows = await connection.awaitQuery(
      `SELECT * FROM
      (${mainQuery}) AS temp
      WHERE Manager is Null`
    );
    console.log("Employees with no manager");
    console.table(rows);
  } else {
    let rows = await connection.awaitQuery(
      `${mainQuery}
        WHERE ?`,
      { "employees.manager_id": answers.chooseManager }
    );
    let manager = await connection.awaitQuery(
      `Select CONCAT(first_name, ' ', last_name) as manager from employees where ?`,
      { id: answers.chooseManager }
    );
    console.log(`Employees managed by ${manager[0].manager}`);
    console.table(rows);
  }
  employees(runPrompt);
};

const addEmployee = async (employees, runPrompt) => {
  const roleList = await getList("title", "roles");
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
  console.clear();
  if (answers.manager !== 0) {
    connection.awaitQuery("insert into employees set ?", {
      first_name: answers.firstName,
      last_name: answers.lastName,
      role_id: answers.role,
      manager_id: answers.manager,
    });
    console.log("employee added");
  } else {
    connection.awaitQuery("insert into employees set ?", {
      first_name: answers.firstName,
      last_name: answers.lastName,
      role_id: answers.role,
    });
    console.log("employee added");
  }
  employees(runPrompt);
};

const editEmployeeRole = async (employees, runPrompt) => {
  let employeeList = await getList(
    "CONCAT(first_name, ' ', last_name)",
    "employees"
  );
  let rolesList = await getList("title", "roles");
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
  console.clear();
  console.log("Role updated");
  employees(runPrompt);
};

const editEmployeeManager = async (employees, runPrompt) => {
  let employeeList = await getList(
    "CONCAT(first_name, ' ', last_name)",
    "employees"
  );
  let managerList = await getList(
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
      choices: managerList,
    },
  ]);
  connection.awaitQuery(`UPDATE employees set ? WHERE ?`, [
    { manager_id: answers.manager },
    { id: answers.alter },
  ]);
  console.clear();
  console.log(`Employee now managed by ${answers.manager}`);
  employees(runPrompt);
};

const deleteEmployee = async (employees, runPrompt) => {
  let employeeList = await getList(
    "CONCAT(first_name, ' ', last_name)",
    "employees"
  );
  let managersList = await getList(
    "CONCAT(first_name, ' ', last_name)",
    "employees where manager_id is Null"
  );
  let answer1 = await inquirer.prompt([
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
  ]);
  if (answer1.check) {
    let managerIndex = managersList.findIndex(
      (manager) => manager.value === answer1.delete
    );
    let answer2;
    console.clear();
    if (managerIndex !== -1) {
      managersList.splice(managerIndex, 1);
      answer2 = await inquirer.prompt([
        {
          name: "alter",
          message: "Which manager will you reassign their subordinates to?:",
          type: "list",
          choices: managersList,
        },
      ]);
    }
    if (answer2) {
      connection.awaitQuery(`UPDATE employees SET ? WHERE ?`, [
        { manager_id: answer2.alter },
        { manager_id: answer1.delete },
      ]);
    }
    connection.awaitQuery(`Delete from employees where ?`, {
      id: answer1.delete,
    });
    console.log("Employee deleted");
  } else {
    console.log("going back to main menu...");
  }
  employees(runPrompt);
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
