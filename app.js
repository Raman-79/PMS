//Intializing dependencies

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const { error } = require('console');

//Database Connection 
const mysql = require('./sqlConnection').con;

//Dotenv Configuration
dotenv.config();
const port = process.env.PORT;

//Ejs 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));

//Middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//Admin Routes
app.get('/', (req, res) => {
    res.render('home', { success: null });
});
var students = []
app.get('/adminHome', (req, res) => {
    const admin = req.query.admin;
    const password = req.query.password;

    if (admin === "admin" && password === "admin@123") {
        var query2 = "select * from company";
        var query = "select * from student";
        mysql.query(query, (error, result) => {
            mysql.query(query2, (error, result2) => {
                console.log(result);
                console.log(result2);
                res.render("adminHome", { students: result, company: result2 })
            })


        });

    }

    else {
        res.render('home', { success: false });
    }
})

//Student Routes
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.post('/signup', (req, res) => {
    var { name, usn, cgpa, branch_code, batch, password } = req.body;
    var query1 = "insert into student (USN,CGPA,Branch_code,Name,Password,Batch)  values ('" + usn + "','" + cgpa + "','" + branch_code + "','" + name + "','" + password + "','" + batch + "')";
    mysql.query(query1, function (error, result) {
        if (error) {
            console.log(error);
            // res.render('/signup', { error, status: true });(Later for any invalid entry)
        }
        else {
            var query2 = "select Name,USN,CGPA,Branch_code,Batch from student where USN = ? ";
            mysql.query(query2, usn, (error, result) => {
                if (error) throw error;
                console.log(result[0].Name);
                res.render('studentHome', { result });
            });
        }
    });
});
app.get('/login', (req, res) => {
    res.render('login', { message: null });
});
app.get('/studentHome', (req, res) => {
    const usn = req.query.usn;
    const password = req.query.password
    console.log(usn, password);
    var query = "select * from student where USN =? and Password =?";
    mysql.query(query, [usn, password], (error, result) => {
        console.log(usn);
        console.log(result);
        if (error) throw error;
        else if (result[0].USN === usn && result[0].Password === password) {
            res.render('studentHome', { result })
        }
        else {
            res.render('login', { message: false })
        }
    })
});


//Company Routes
app.get('/cmpLogin', (req, res) => {
    res.render('cmpLogin', { message: null });
});

app.get('/cmpHome', (req, res) => {
    const name = req.query.Cmpname;
    const password = req.query.password;

    var query = "select * from company where CMP_name = ? and Cmp_password = ?";
    mysql.query(query, [name, password], (error, result) => {
        console.log(name);
        console.log(password);
        console.log(result);
        if (error) {

            console.log(error);
            res.render('cmpLogin', { message: false });
        }
        else {

            res.render('cmpHome', { result, message: true });
        }
    });
})

app.get('/cmpSignUp', (req, res) => {
    res.render('cmpSignUp');
});
app.post('/cmpSignUp', (req, res) => {
    var { Cmpname, Role, Criteria, App_deadline, Description, Salary, Password } = req.body;
    var q1 = "insert into company (Cmp_Name,Role,Criteria,App_deadline,Description,Salary,Cmp_password)  values('" + Cmpname + "','" + Role + "','" + Criteria + "','" + App_deadline + "','" + Description + "','" + Salary + "','" + Password + "') ";
    mysql.query(q1, (error, result) => {
        if (error) throw error;
        res.send("Registered Succesfull")
    });

})
app.listen(port, () => {
    console.log(`Server connection successfull at ${port}`);
});
