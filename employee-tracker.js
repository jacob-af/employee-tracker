const mysql = require('mysql');
const inquirer = require('inquirer')
const util = require('util');
const cTable = require('console.table')

const questions = require("./assets/questions.js");

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'b00tcamp',
    database: 'employee_db',
});

connection.query = util.promisify(connection.query);

const addDepartment = () => {
    //code to add new department

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
                        message: "Enter new employee's first name",
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

const addRole = (data) => {
    //code to add new role
}

const viewDepartment = () => {
    //return view department table
}

const viewRoles = () => {
    //return view role table
}

const viewEmployees = () => {
    connection.query(
        "SELECT employees.id, employees.first_name AS 'First Name', employees.last_name AS 'Last Name', role.title as Title, role.salary AS Salary, departments.department_name AS Department, CONCAT(manager.first_name, ' ', manager.last_name) AS Manager FROM employees JOIN role ON employees.role_id = role.id JOIN departments ON role.department_id = departments.id LEFT JOIN employees AS manager ON employees.manager_id = manager.id", (err, rows) => {
            if (err) throw err;
            console.log("All Employees")
            console.table(rows)
            runPrompt();
        })
}

const updateManager = (data) => {

}

const viewEmployeesByManager = () => {
    // view employee by manager
}

const deleteDepartment = (data) => {
    //drop a row
}

const deleteRole = (data) => { }

const deleteEmployee = (data) => { }

const viewDepartmentBudgetUsage = (data) => {

}

const farewell = () => {
    console.log("farewell")
}

const runPrompt = async () => {
    let answers = await inquirer.prompt(questions)
    //switch-case for answers
    switch (answers.action) {
        case 'View All Employees':
            viewEmployees();
            break;
        case 'View All Employees by department':
            viewDepartment();
        case 'View all employees by manager':
            viewManager();
        case 'Add Employee':
            addEmployee();
            break;
        case 'Remove Employee':
            deleteEmployee();
        case 'Update Employee Role':
            return;
        case 'Update Employee Manager':
            return;
        case 'Remove Role':
            return;
        case 'Remove Department':
            return;
        case 'Exit':
            connection.end();
            farewell()
            break;
        default:
            connection.end();
            console.log("how did you do that?")
            break;
    }
}

connection.connect((err) => {
    if (err) throw err;
    runPrompt()
});
