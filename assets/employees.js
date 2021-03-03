const inquirer = require('inquirer')

const viewEmployees = async (connection, employees) => {
    connection.query(
        "SELECT employees.id, employees.first_name AS 'First Name', employees.last_name AS 'Last Name', role.title as Title, role.salary AS Salary, departments.department_name AS Department, CONCAT(manager.first_name, ' ', manager.last_name) AS Manager FROM employees JOIN role ON employees.role_id = role.id JOIN departments ON role.department_id = departments.id LEFT JOIN employees AS manager ON employees.manager_id = manager.id", (err, rows) => {
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
                        employees();
                    })
            } else {
                connection.query(
                    "SELECT employees.id, employees.first_name AS 'First Name', employees.last_name AS 'Last Name', role.title as Title, role.salary AS Salary, departments.department_name AS department, CONCAT(manager.first_name, ' ', manager.last_name) AS Manager FROM employees JOIN role ON employees.role_id = role.id JOIN departments ON role.department_id = departments.id LEFT JOIN employees AS manager ON employees.manager_id = manager.id WHERE ?",
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

module.exports = { viewEmployees, viewEmployeesByDepartment };