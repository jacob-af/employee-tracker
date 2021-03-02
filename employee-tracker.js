const mysql = require('mysql-await');
const inquirer = require('inquirer')
const cTable = require('console.table')

const questions = require("./assets/questions.js");

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'b00tcamp',
    database: 'employee_db',
});

const viewEmployees = () => {
    connection.query(
        "SELECT employees.id, employees.first_name AS 'First Name', employees.last_name AS 'Last Name', role.title as Title, role.salary AS Salary, departments.department_name AS Department, CONCAT(manager.first_name, ' ', manager.last_name) AS Manager FROM employees JOIN role ON employees.role_id = role.id JOIN departments ON role.department_id = departments.id LEFT JOIN employees AS manager ON employees.manager_id = manager.id", (err, rows) => {
            if (err) throw err;
            console.log("All Employees")
            console.table(rows)
            runPrompt();
        })
}

const viewEmployeesByDepartment = async () => {
    //return view department table
    connection.query("Select id, department_name from departments;",
        async (err, rows) => {
            if (err) throw err;
            let departments = rows.map((row) => {
                return row.department_name
            })
            departments = ["All", ...departments]
            console.log(departments)
            let answers = await inquirer.prompt([
                {
                    type: "list",
                    name: "chooseDepartment",
                    message: "Which department would you like to view?: ",
                    choices: departments
                },
            ])
            if (answers.chooseDepartment === "All") {
                connection.query(
                    "SELECT employees.id, employees.first_name AS 'First Name', employees.last_name AS 'Last Name', role.title as Title, role.salary AS Salary, departments.department_name AS Department, CONCAT(manager.first_name, ' ', manager.last_name) AS Manager FROM employees JOIN role ON employees.role_id = role.id JOIN departments ON role.department_id = departments.id LEFT JOIN employees AS manager ON employees.manager_id = manager.id ORDER BY Department", (err, rows) => {
                        if (err) throw err;
                        console.log("All Employees")
                        console.table(rows)
                        runPrompt();
                    })
            } else {
                connection.query(
                    "SELECT employees.id, employees.first_name AS 'First Name', employees.last_name AS 'Last Name', role.title as Title, role.salary AS Salary, departments.department_name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS Manager FROM employees JOIN role ON employees.role_id = role.id JOIN departments ON role.department_id = departments.id LEFT JOIN employees AS manager ON employees.manager_id = manager.id WHERE ?",
                    { "departments.department_name": answers.chooseDepartment },
                    (err, rows) => {
                        if (err) throw err;
                        console.log("All Employees")
                        console.table(rows)
                        runPrompt();
                    })
            }

        }
    )
}

const viewEmployeesByManager = async () => {
    // view employee by manager
    connection.query("Select id, CONCAT(first_name, ' ', last_name) as manager from employees where manager_id is NULL",
        async (err, rows) => {
            if (err) throw err;
            let managers = rows.map((row) => {
                return row.manager
            })
            managers = ["No Manager", ...managers]
            let answers = await inquirer.prompt([
                {
                    type: "list",
                    name: "chooseManager",
                    message: "Which manager's team would you like to view?: ",
                    choices: managers
                },
            ])
            if (answers.chooseManager === "No Manager") {
                connection.query(
                    `SELECT * FROM
                    (
                    SELECT 
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
                        LEFT JOIN employees AS manager ON employees.manager_id = manager.id
                    ) as temp
                    WHERE Manager is Null`, (err, rows) => {
                    if (err) throw err;
                    console.log("Employees with no manager")
                    console.table(rows)
                    runPrompt();
                })
            } else {
                connection.query(
                    `SELECT * FROM
                    (
                    SELECT 
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
                        LEFT JOIN employees AS manager ON employees.manager_id = manager.id
                    ) as temp
                    WHERE ?`,
                    { "Manager": answers.chooseManager },
                    (err, rows) => {
                        if (err) throw err;
                        console.log(`Employees managed by ${answers.chooseManager}`)
                        console.table(rows)
                        runPrompt();
                    })
            }

        }
    )
}

const addEmployee = async () => {
    connection.query("Select id, title from role", async (err, rows) => {
        if (err)
            throw err;
        let roles = rows.map((row, index) => {
            return { name: row.title, value: row.id };
        });
        connection.query("Select id, CONCAT(first_name, ' ', last_name) as manager from employees where manager_id is NULL",
            async (err, rows) => {
                if (err) throw err;
                let managers = rows.map((row) => {
                    return { name: row.manager, value: row.id }
                })
                managers = [{ name: "none", value: 0 }, ...managers]
                let answers = await inquirer.prompt([
                    {
                        type: "input",
                        name: "firstName",
                        message: "Enter new employee's first name",

                    },
                    {
                        name: "lastName",
                        message: "Enter new employee's last name",
                        type: "input"
                    },
                    {
                        name: "role",
                        message: "select employee role:",
                        type: "list",
                        choices: roles
                    },

                    {
                        name: "manager",
                        message: "select employee manager:",
                        type: "list",
                        choices: managers

                    },
                ])
                if (answers.manager !== 0) {
                    connection.query("insert into employees set ?", {
                        first_name: answers.firstName,
                        last_name: answers.lastName,
                        role_id: answers.role,
                        manager_id: answers.manager
                    },
                        (err) => {
                            if (err) throw err;
                            console.log('employee added');
                            runPrompt()
                        }
                    )
                } else {
                    connection.query("insert into employees set ?", {
                        first_name: answers.firstName,
                        last_name: answers.lastName,
                        role_id: answers.role
                    },
                        (err) => {
                            if (err) throw err;
                            console.log('employee added');
                            runPrompt()
                        }
                    )
                }

            }
        )
    })



    //code to add new employee


}

const editEmployee = async () => {

}

const deleteEmployee = () => { }

const viewDepartments = () => {
    connection.query(
        `SELECT 
            *
        FROM departments`,
        (err, rows) => {
            if (err) throw err;
            console.log("Current Departments")
            console.table(rows)
            runPrompt();
        })
}

const viewDepartmentBudgetUsage = (data) => {

}

const addDepartment = async () => {
    //code to add new department
    const departments = await getList('department_name', 'departments')
    let answers = await inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "What is the name of the new depatment?: ",
            validate: function () {
                if (titles.findIndex(title => title.title === newRole) !== -1 || newRole === '') {
                    console.log('that role already exists')
                    return false;
                } else {
                    return true;
                }
            }
        },
        {
            type: "number",
            name: "salary",
            message: "How much will this role be paid? "
        },
        {
            type: 'list',
            name: 'department',
            message: "Which department will they be working in?",
            choices: departments
        },
    ])
}


const deleteDepartment = (data) => {
    //drop a row
}



const viewRoles = () => {
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
            console.log("Current Roles")
            console.table(rows)
            runPrompt();
        })
}

const addRole = async () => {
    //code to add new role
    const titles = await getList('title', 'role')
    const departments = await getList('department_name', 'departments')
    let answers = await inquirer.prompt([
        {
            type: "input",
            name: "newRole",
            message: "What is the name of the new role?: ",
            validate: function (newRole) {
                if (titles.findIndex(title => title.title === newRole) !== -1 || newRole === '') {
                    console.log('that role already exists')
                    return false;
                } else {
                    return true;
                }
            }
        },
        {
            type: "number",
            name: "salary",
            message: "How much will this role be paid? "
        },
        {
            type: 'list',
            name: 'department',
            message: "Which department will they be working in?",
            choices: departments
        },
    ])
    connection.query("insert into role set ?", {
        title: answers.newRole,
        salary: answers.salary,
        department_id: answers.department
    },
        (err) => {
            if (err) throw err;
            console.log('New Role Added');
            runPrompt()
        }
    )
    console.log(answers)

}

const deleteRole = (data) => { }

const getList = async (field, table) => {
    let list = await connection.awaitQuery(`Select id, ${field} from ${table}`)
    list = list.map(row => {
        return { name: row[`${field}`], value: row.id }
    })
    return list
}

const farewell = () => {
    connection.end();
    console.log("farewell")
}

// const runPrompt = async () => {
//     let answers = await inquirer.prompt(questions)
//     //switch-case for answers
//     switch (answers.action) {
//         case 'View All Employees':
//             viewEmployees();
//             break;
//         case 'View All Employees by department':
//             viewEmployeesByDepartment();
//             break;
//         case 'View all employees by manager':
//             viewEmployeesByManager();
//             break;
//         case "View Roles":
//             viewRoles();
//             break;
//         case 'Add Employee':
//             addEmployee();
//             break;
//         case 'Add Role':
//             addRole();
//             break;
//         case 'Update Employee Role':
//             return;
//         case 'Update Employee Manager':
//             return;
//         case 'Remove Role':
//             return;
//         case 'Remove Department':
//             return;
//         case 'Exit':
//             connection.end();
//             farewell()
//             break;
//         
//     }
// }

const runPrompt = async () => {
    let answers = await inquirer.prompt(questions)
    switch (answers.action) {
        case 'View, add, edit, or delete Employee':
            employees(answers.employees);
            break;
        case 'View, add, edit, or delete Role':
            roles(answers.roles);
            break;
        case 'View, add, edit, or delete Department':
            departments(answers.departments);
            break;
        case 'Exit':
            farewell();
            break;
        default:
            connection.end();
            console.log("how did you do that?")
            break;
    }
}

const employees = (choice) => {
    switch (choice) {
        case 'View All Employees':
            viewEmployees();
            break;
        case 'View All Employees By Department':
            viewEmployeesByDepartment();
            break;
        case 'View All Employees By Manager':
            viewEmployeesByManager();
            break;
        case 'Add Employee':
            addEmployee();
            break;
        case 'Edit Employee':
            editEmployee();
            break;
        case 'Delete Employee':
            deleteEmployee();
        case 'Return to main menu':
        default:
            runPrompt()
            break;
    }
}

const departments = (choice) => {
    switch (choice) {
        case 'View Departments':
            viewDepartments();
            break;
        case "View Departments' Budget":
            viewDepartmentBudgetUsage();
            break;
        case 'Add Department':
        case 'Edit Department':
        case 'Delete Department':
        case 'Return to main menu':
        default:
            runPrompt()
            break;
    }
}

const roles = (choice) => {
    switch (choice) {
        case 'View Roles':
            viewRoles();
            break;
        case 'Add Role':
            addRole();
            break;
        // case 'Edit Role':
        // case 'Delete Role':
        case 'Return to main menu':
        default:
            runPrompt()
            break;
    }
}


connection.connect((err) => {
    if (err) throw err;
    runPrompt()
});
