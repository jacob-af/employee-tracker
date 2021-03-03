const mysql = require('mysql-await');
const inquirer = require('inquirer')
const cTable = require('console.table')

const questions = require("./assets/questions.js");
const { viewEmployees, viewEmployeesByDepartment } = require("./assets/employees.js")

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'b00tcamp',
    database: 'employee_db',
});

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

const editEmployeeRole = async () => {
    let employeeList = await getList("CONCAT(first_name, ' ', last_name)", "employees")
    let rolesList = await getList("title", 'role')
    let answers = await inquirer.prompt([
        {
            name: "alter",
            message: "Which Employee are you reassigning to a new role?:",
            type: "list",
            choices: employeeList
        },
        {
            name: "role",
            message: "What is their new role?:",
            type: "list",
            choices: rolesList
        },
    ])
    connection.query(
        `UPDATE employees set ? WHERE ?`,
        [{ role_id: answers.role },
        { id: answers.alter }],
        (err, rows) => {
            if (err) {
                console.log("Role could not be updated")
            }
            console.log("Role updated")
            runPrompt();
        })
}

const editEmployeeManager = async () => {
    let employeeList = await getList("CONCAT(first_name, ' ', last_name)", "employees")
    let managersList = await getList("CONCAT(first_name, ' ', last_name)", 'employees where manager_id is Null')
    let answers = await inquirer.prompt([
        {
            name: "alter",
            message: "Which Employee are you reassigning to a new manager?:",
            type: "list",
            choices: employeeList
        },
        {
            name: "manager",
            message: "Who will the new manager be?:",
            type: "list",
            choices: managersList
        },
    ])
    connection.query(
        `UPDATE employees set ? WHERE ?`,
        [{ manager_id: answers.manager },
        { id: answers.alter }],
        (err, rows) => {
            if (err) {
                console.log("Manager could not be updated")
            }
            console.log("Manager updated")
            runPrompt();
        })
}

const deleteEmployee = async () => {
    let employeeList = await getList("CONCAT(first_name, ' ', last_name)", "employees")
    let managersList = await getList('manager_id', 'employees where manager_id is Null')
    console.log(managersList)
    let answers = await inquirer.prompt([
        {
            name: "delete",
            message: "Which Employee are you Deleting?:",
            type: "list",
            choices: employeeList
        },
        {
            name: "check",
            message: 'are you sure?',
            type: "confirm"
        },
        {
            when: answers => managersList.findIndex(manager => manager.value === answers.delete) !== -1,
            name: "dblCheck",
            message: "deleting a manager will delete all of their subordiates\nARE YOU SURE?",
            type: 'confirm'
        }
    ])
    if (answers.check) {
        if (answers.dblCheck) {
            connection.query(
                `Delete from employees where ?`,
                { manager_id: answers.delete },
                (err, rows) => {
                    if (err) {
                        console.log("You may not delete this employee")
                    }
                })
        }
        connection.query(
            `Delete from employees where ?`,
            { id: answers.delete },
            (err, rows) => {
                if (err) {
                    console.log("You may not delete this employee")
                }
                console.log("Employee deleted")
                runPrompt();
            })
    } else {
        console.log('going back to main menu...')
        runPrompt()
    }
}

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
            name: "newDepartment",
            message: "What is the name of the new department?: ",
            validate: function (newDepartment) {
                if (departments.findIndex(department => department.name === newDepartment) !== -1 || newDepartment === '') {
                    console.log('\nthat department already exists')
                    return false;
                } else {
                    return true;
                }
            }
        },
    ])
    connection.query("insert into departments set ?", {
        department_name: answers.newDepartment
    },
        (err) => {
            if (err) throw err;
            console.log('New Department Added');
            runPrompt()
        }
    )
}


const deleteDepartment = async () => {
    //drop a row
    let departmentList = await getList("department_name", "department")
    console.log(managersList)
    let answers = await inquirer.prompt([
        {
            name: "delete",
            message: "Which Department are you Deleting?:",
            type: "list",
            choices: departmentList
        },
        {
            name: "check",
            message: 'are you sure?',
            type: "confirm"
        },
        {
            when: answers => managersList.findIndex(manager => manager.value === answers.delete) !== -1,
            name: "dblCheck",
            message: "deleting a department will delete all of their subordiates\nARE YOU SURE?",
            type: 'confirm'
        }
    ])
    if (answers.check) {
        if (answers.dblCheck) {
            connection.query(
                `Delete from employees where ?`,
                { manager_id: answers.delete },
                (err, rows) => {
                    if (err) {
                        console.log("You may not delete this employee")
                    }
                })
        }
        connection.query(
            `Delete from employees where ?`,
            { id: answers.delete },
            (err, rows) => {
                if (err) {
                    console.log("You may not delete this employee")
                }
                console.log("Employee deleted")
                runPrompt();
            })
    } else {
        console.log('going back to main menu...')
        runPrompt()
    }
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
                if (titles.findIndex(title => title.name === newRole) !== -1 || newRole === '') {
                    console.log('\nthat role already exists')
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
}

const deleteRole = async () => {
    const titles = await getList('title', 'role')
}

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
            viewEmployees(connection, employees);
            break;
        case 'View All Employees By Department':
            viewEmployeesByDepartment(connection, employees);
            break;
        case 'View All Employees By Manager':
            viewEmployeesByManager(connection, employees);
            break;
        case 'Add Employee':
            addEmployee(connection, employees);
            break;
        case 'Edit Employee Role':
            editEmployeeRole(connection, employees);
            break;
        case 'Edit Employee Manager':
            editEmployeeManager(connection, employees);
            break;
        case 'Delete Employee':
            deleteEmployee(connection, employees);
            break;
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
            addDepartment();
            break;
        case 'Edit Department':
        case 'Delete Department':
            deleteDepartment();
            break;
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
