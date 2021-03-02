INSERT INTO departments (department_name)
Values ("Operations"),
    ("Marketing"),
    ("Accounting"),
    ("HR"),
    ("Development");
insert into role (title, salary, department_id)
Values ("Director of Operations", 150000, 1),
    ("Head of Marketing", 100000, 2),
    ("Marketing Guy", 60000, 2),
    ("Accountant", 75000, 3),
    ("Lead Developer", 90000, 5),
    ("Junior Developer", 55000, 5);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Jacob", "Feitler", 1, NULL),
    ("Destry", "Gustin", 5, NULL),
    ("Bob", "Ross", 2, 1),
    ("Jack", "Jackson", 5, 2);