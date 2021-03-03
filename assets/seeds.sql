INSERT INTO departments (department_name)
Values ("Operations"),
    ("Marketing"),
    ("Accounting"),
    ("HR"),
    ("Development");
insert into roles (title, salary, department_id)
Values ("Director of Operations", 150000, 1),
    ("Operations Manager", 120000, 1),
    ("Head of Marketing", 100000, 2),
    ("Senior Marketing", 60000, 2),
    ("Head of Accounting", 90000, 3),
    ("Accountant", 75000, 3),
    ("HR Lead", 80000, 4),
    ("Junior HR", 50000, 4),
    ("Lead Developer", 90000, 5),
    ("Junior Developer", 60000, 5);
insert into employees (first_name, last_name, role_id, manager_id)
values ("Jacob", "Feitler", 1, NULL),
    ("Rick", "Ross", 2, 1),
    ("Diana", "Ross", 3, NULL),
    ("Princess", "Di", 4, 3),
    ("Bob", "Ross", 5, NULL),
    ("Bob", "Saget", 6, 5),
    ("Ross", "Geller", 7, NULL),
    ("Rahel", "Green", 8, 7),
    ("Destry", "Gustin", 9, NULL),
    ("Michael", "Scott", 10, 9);