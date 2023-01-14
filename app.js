//Intializing dependencies

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const { error } = require('console');
var url = require('url');
const { response } = require('express');

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
        var query2 = "select * from company";
        var query = "select * from student";
        mysql.query(query, (error, result) => {
            mysql.query(query2, (error, result2) => {
                res.render("adminHome", { students: result, company: result2 })
            })
        });

    }

    else {
        res.render('home', { success: false });
    }
})
app.get('/delete-student', (req, res) => {
    const id = req.query.id;
    var address = "http://localhost:5000/adminHome?admin=admin&password=admin%40123"
    var query = "delete from student where Stu_id = ?";
    mysql.query(query, [id], (error, result) => {
        if (error) throw error;
        res.redirect(address);
    })
})



//Student Routes
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.post('/signup', (req, res) => {
    var { name, usn, cgpa, batch, branch_code, password } = req.body;
    var query = "insert into student (Name,USN,Branch_code,CGPA,Batch,Password) values ('" + name + "','" + usn + "','" + branch_code + "','" + cgpa + "','" + batch + "','" + password + "')";
    mysql.query(query, (error, result) => {
        if (error) throw error;
        res.send("Registration Successfull")
    })
})
app.get('/login', (req, res) => {
    res.render('login', { message: null });
});
app.get('/studentHome', (req, res) => {
    const usn = req.query.usn;
    const password = req.query.password;
    var query = "select * from student where USN = ? and Password =?";
    var cmpQuery = "select  * from company";
    mysql.query(query, [usn, password], (error, result) => {
        if (result[0].USN === usn && result[0].Password === password) {
            mysql.query(cmpQuery, (error, result1) => {
                if (error) throw error;
                res.render('studentHome', { result, company: result1 })
            })
        }
        else {
            res.render('login', { message: false })
        }
    })
});

app.get('/submit-application', (req, res) => {
    const { usn, password, CMP_id, Stu_id } = req.query;
    var address = "http://localhost:5000/studentHome?usn=" + usn + "&password=" + password
    var query = "insert into application (Cmp_id,Stu_id,Status) values ('" + CMP_id + "','" + Stu_id + "','Pending') "
    mysql.query(query, (error, result) => {
        res.redirect(address)
    })
})




//Company Routes
app.get('/cmpLogin', (req, res) => {
    res.render('cmpLogin', { message: null });
});

app.get('/cmpHome', (req, res) => {
    const name = req.query.Cmpname;
    const password = req.query.password;

    var query = "select * from company where CMP_name = ? and Cmp_password = ?";
    mysql.query(query, [name, password], (error, result) => {
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
