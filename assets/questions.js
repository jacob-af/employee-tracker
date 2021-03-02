const questions = [
  {
    name: 'action',
    type: 'rawlist',
    message: 'What would you like to do?',
    choices: [
      'View All Employees',
      'View All Employees by department',
      'View all employees by manager',
      'View Roles',
      'Add Employee',
      'Add Role',
      'Add Department',
      'Remove Employee',
      'Update Employee Role',
      'Update Employee Manager',
      'Remove Role',
      'Remove Department',
      'Exit'
    ],
  }
];

const newQuestions = [
  {
    name: 'action',
    type: 'rawlist',
    message: 'What would you like to do?',
    choices: [
      'View, add, edit, or delete Employee',
      'View, add, edit, or delete Role',
      'View, add, edit, or delete Department',
      'Exit'
    ],
  },
  {
    when: answers => answers.action === 'View, add, edit, or delete Employee',
    name: 'employee',
    type: 'rawlist',
    message: 'What would you like to do?',
    choices: [
      'View All Employees',
      'View All Employees By Department',
      'View All Employees By Manager',
      'Add Employee',
      'Edit Employee',
      'Delete Employee',
      'Return to main menu'
    ],
  },
  {
    when: answers => answers.action === 'View, add, edit, or delete Role',
    name: 'departments',
    type: 'rawlist',
    message: 'What would you like to do?',
    choices: [
      'View Departments',
      "View Departments' Budget",
      'Add Department',
      'Edit Department',
      'Delete Department',
      'Return to main menu'
    ],
  },
  {
    when: answers => answers.action === 'View, add, edit, or delete Department',
    name: 'roles',
    type: 'rawlist',
    message: 'What would you like to do?',
    choices: [
      'View Roles',
      'Add Role',
      'Edit Role',
      'Delete Role',
      'Return to main menu'
    ],
  },
]

module.exports = newQuestions