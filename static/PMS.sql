use placement_db;


create table application (
App_id integer auto_increment primary key,
Stu_id int ,
Cmp_id int,
Status varchar(20),
foreign key (Stu_id) references student (Stu_id) on delete cascade,
foreign key (Cmp_id) references company (CMP_Id) on delete cascade
);


create table company (
CMP_Name int auto_increment primary key,
Role varchar (30),
Criteria float,
App_deadline varchar (100),
Description varchar (255),
Salary varchar (10),
Cmp_password varchar(20)
);



create table officer (
ID integer auto_increment primary key,
Name varchar (50),
Password varchar(20),
Batch int
);


create table query (
Q_id int auto_increment primary key,
Q_text varchar(255),
Q_date date,
Rep_id int,
Email varchar (50),
S_id int
);

create table student (
USN varchar(10),
Stu_id int auto_increment primary key,
Batch int ,
Name varchar (30),
Password varchar(20),
CGPA float,
Branch_code varchar(4)
);


