const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const { error } = require('console');

const mysql = require('./sqlConnection').con;
dotenv.config();
const port = process.env.PORT;
let student = [];
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.render('home');
});
app.get('/signup', (req, res) => {
    res.render('signup');

});
app.post('/signup', (req, res) => {
    var { name, usn, cgpa, branch_code, batch, password } = req.body;
    var query1 = "insert into student (USN,CGPA,Branch_code,Name,Password,Batch)  values ('" + usn + "','" + cgpa + "','" + branch_code + "','" + name + "','" + password + "','" + batch + "')";
    mysql.query(query1, function (error, result) {
        if (error) throw error;
        res.send("Entry Succesfull");
    });
});
app.get('/login', (req, res) => {
    res.render('login');
})
app.get('/cmpLogin', (req, res) => {
    res.render('cmpLogin');
})
app.get('/cmpSignUp', (req, res) => {
    res.render('cmpSignUp');
})
app.listen(port, () => {
    console.log(`Server connection successfull at ${port}`);
});
app.get('/studentDets', (req, res) => {
    var query = "select * from student";
    mysql.query(query, (error, result) => {
        if (error) throw error;
        student = result;
        res.render("studentDets", { student });
    });
})

