const mysql = require('mysql-await');
const inquirer = require('inquirer')
const cTable = require('console.table')

const questions = require("./assets/questions.js");
const { viewEmployees, viewEmployeesByDepartment, viewEmployeesByManager, addEmployee, editEmployeeRole, editEmployeeManager, deleteEmployee } = require("./assets/employees.js")

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'b00tcamp',
    database: 'employee_db',
});

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

const viewDepartmentBudgetUsage = () => {
    connection.query(
        `SELECT 
            departments.id, departments.department_name, SUM(role.salary)
        FROM departments
        LEFT JOIN role ON departments.id = role.department_id
        GROUP BY departments.id`,
        (err, rows) => {
            if (err) throw err;
            console.log("Current Departments")
            console.table(rows)
            runPrompt();
        })
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
