const questions = [
  {
    name: "action",
    type: "rawlist",
    message: "What would you like to do?",
    choices: [
      "View, add, edit, or delete Employee",
      "View, add, edit, or delete Role",
      "View, add, edit, or delete Department",
      "View payroll total for each Department",
      "Exit",
    ],
  },
  {
    when: (answers) => answers.action === "View, add, edit, or delete Employee",
    name: "employees",
    type: "rawlist",
    message: "What would you like to do?",
    choices: [
      "View All Employees",
      "View All Employees By Department",
      "View All Employees By Manager",
      "Add Employee",
      "Edit Employee Role",
      "Edit Employee Manager",
      "Delete Employee",
      "Return to main menu",
    ],
  },
  {
    when: (answers) =>
      answers.action === "View, add, edit, or delete Department",
    name: "departments",
    type: "rawlist",
    message: "What would you like to do?",
    choices: [
      "View Departments",
      "Add Department",
      "Delete Department",
      "Return to main menu",
    ],
  },
  {
    when: (answers) => answers.action === "View, add, edit, or delete Role",
    name: "roles",
    type: "rawlist",
    message: "What would you like to do?",
    choices: [
      "View Roles",
      "Add Role",
      "Edit Salary",
      "Edit Department",
      "Delete Role",
      "Return to main menu",
    ],
  },
];

module.exports = questions;
