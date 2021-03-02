INSERT INTO departments (deparment_name) Values ("Operations"), ("Marketing"), ("Accounting"), ("HR"), ("Development");

insert into role (title, salary, department_id) Values 
("Director of Operations", 150000,1),
("Head of Marketing", 100000, 2),
("Marketing Guy", 60000, 2),
("Accountant", 75000, 3);

insert into employees (first_name, last_name, role_id, manager_id) values 
("Jacob", "Feitler", 1, NULL),
("Bob", "Ross", 2, 1)