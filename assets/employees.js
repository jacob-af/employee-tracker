const inquirer = require('inquirer')
const getList = require('./getList.js')

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
    LEFT JOIN employees AS manager ON employees.manager_id = manager.id`

const viewEmployees = async (connection, employees) => {
    connection.query(
        mainQuery, (err, rows) => {
            if (err) throw err;
            console.log("All Employees")
            console.table(rows)
            employees();
        })
}

const viewEmployeesByDepartment = async (connection, employees) => {
    //return view department table
    connection.query("Select id, department_name from departments;",
        async (err, rows) => {
            if (err) throw err;
            let departments = rows.map((row) => {
                return row.department_name
            })
            departments = ["All", ...departments]
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
                    `${mainQuery} ORDER BY Department`, (err, rows) => {
                        if (err) throw err;
                        console.log("All Employees")
                        console.table(rows)
                        employees();
                    })
            } else {
                connection.query(
                    `${mainQuery} WHERE ?`,
                    { "departments.department_name": answers.chooseDepartment },
                    (err, rows) => {
                        if (err) throw err;
                        console.log("All Employees")
                        console.table(rows)
                        employees();
                    })
            }

        }
    )
}

const viewEmployeesByManager = async (connection, employees) => {
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
                        ${mainQuery}
                    ) as temp
                    WHERE Manager is Null`, (err, rows) => {
                    if (err) throw err;
                    console.log("Employees with no manager")
                    console.table(rows)
                    employees();
                })
            } else {
                connection.query(
                    `SELECT * FROM
                    (
                        ${mainQuery}
                    ) as temp
                    WHERE ?`,
                    { "Manager": answers.chooseManager },
                    (err, rows) => {
                        if (err) throw err;
                        console.log(`Employees managed by ${answers.chooseManager}`)
                        console.table(rows)
                        employees();
                    })
            }

        }
    )
}

const addEmployee = async (connection, employees) => {
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
                            employees()
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
                            employees()
                        }
                    )
                }

            }
        )
    })
}

const editEmployeeRole = async (connection, employees) => {
    let employeeList = await getList(connection, "CONCAT(first_name, ' ', last_name)", "employees")
    let rolesList = await getList(connection, "title", 'role')
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
            employees();
        })
}

const editEmployeeManager = async (connection, employees) => {
    let employeeList = await getList(connection, "CONCAT(first_name, ' ', last_name)", "employees")
    let managersList = await getList(connection, "CONCAT(first_name, ' ', last_name)", 'employees where manager_id is Null')
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
            employees();
        })
}

const deleteEmployee = async (connection, employees) => {
    let employeeList = await getList(connection, "CONCAT(first_name, ' ', last_name)", "employees")
    let managersList = await getList(connection, 'manager_id', 'employees where manager_id is Null')
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
                employees();
            })
    } else {
        console.log('going back to main menu...')
        employees()
    }
}


module.exports = { viewEmployees, viewEmployeesByDepartment, viewEmployeesByManager, addEmployee, editEmployeeRole, editEmployeeManager, deleteEmployee };