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

app.get('/adminHome', (req, res) => {
    const admin = req.query.admin;
    const password = req.query.password;
    if (admin === "admin" && password === "admin@123") {
        var query = "select * from student";
        mysql.query(query, (error, result) => {
            if (error) throw error;
            res.render("adminHome", { result, success: true });
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
    res.render('cmpLogin');
})
app.get('/cmpSignUp', (req, res) => {
    res.render('cmpSignUp');
})
app.listen(port, () => {
    console.log(`Server connection successfull at ${port}`);
});
