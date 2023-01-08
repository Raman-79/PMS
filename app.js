const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const { error } = require('console');

const mysql = require('./sqlConnection').con;
dotenv.config();
const port = process.env.PORT;

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.render('home', { success: null });
});
app.get('/signup', (req, res) => {
    res.render('signup');
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
app.post('/signup', (req, res) => {
    var { name, usn, cgpa, branch_code, batch, password } = req.body;
    var query1 = "insert into student (USN,CGPA,Branch_code,Name,Password,Batch)  values ('" + usn + "','" + cgpa + "','" + branch_code + "','" + name + "','" + password + "','" + batch + "')";
    mysql.query(query1, function (error, result) {
        if (error) throw error;
        else {
            var query2 = "select Name,USN,CGPA,Branch_code,Batch from student where USN = ? ";
            mysql.query(query2, usn, (error, result) => {
                if (error) throw error;
                res.render('studentHome', { result });
            });
        }
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

// var query = "select * from student";
// mysql.query(query, (error, result) => {
//     if (error) throw error;
//     for (var i = 0; i < result.length; i++) {
//         console.log(result[i].Stu_id);
//     }
// })