const questions = [
    {
      name: 'action',
      type: 'rawlist',
      message: 'What would you like to do?',
      choices: [
        'View All Employees',
        'View All Employees by department',
        'View all employees by manager',
        'Add Employee',
        'Remove Employee',
        'Update Employee Role',
        'Update Employee Manager',
        'Remove Role',
        'Remove Department',
        'Exit'
      ],
    }
];

module.exports = questions