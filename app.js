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
        var query3 = "select distinct S.USN,C.CMP_Name,A.Status from student S ,company C ,application A where S.Stu_id = A.Stu_id and C.Cmp_id = A.Cmp_id group by C.CMP_Name ;"
        mysql.query(query, (error, result) => {
            mysql.query(query2, (error, result2) => {
                mysql.query(query3, (error, result3) => {
                    res.render("adminHome", { students: result, company: result2, applications: result3 })
                })

            })
        });

    }

    else {
        res.render('home', { success: false });
    }
})
app.get('/delete-student', (req, res) => {
    const id = req.query.id;
    var address = "http://localhost:" + port + "/adminHome?admin=admin&password=admin%40123"
    var query = "delete from student where Stu_id = ?";
    mysql.query(query, [id], (error, result) => {
        if (error) throw error;
        res.redirect(address);
    })
});

app.get('/update-company', (req, res) => {
    var { cmpName, role, criteria, salary, app_deadline } = req.query;
    var values = [cmpName, role, criteria, salary, app_deadline];
    res.render('update_form', { values });
})
app.post('/update-company', (req, res) => {
    var { cmpName, role, criteria, salary, app_deadline, Description } = req.body;
    var address = "http://localhost:5000/update-company?cmpName=" + cmpName + "&role=" + role + "&criteria=" + criteria + "&salary=" + salary + "&app_deadline=" + app_deadline;
    var values = [cmpName, role, criteria, app_deadline, Description, salary, cmpName, role];
    console.log(values);
    var query = "update company set CMP_Name = ?,Role = ?,Criteria = ?,App_deadline = ?,Description = ?,Salary = ?  where CMP_Name = ? and Role = ? ";
    mysql.query(query, values, (error, result) => {
        if (error) throw error;
        res.redirect(address)
    })
})



//Student Routes
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.post('/signup', (req, res) => {
    var { name, usn, cgpa, batch, branch_code, password } = req.body;
    var query = "insert into student (Name,USN,Branch_code,CGPA,Batch,Password) values ('" + name + "','" + usn + "','" + branch_code + "','" + cgpa + "','" + batch + "','" + password + "')";
    var address = "http://localhost:" + port + "/studentHome?usn=" + usn + "&password=" + password
    mysql.query(query, (error, result) => {
        if (error) throw error;
        res.redirect(address);
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
    var application = "select * from application where Stu_id = ? "
    mysql.query(query, [usn, password], (error, result) => {
        var id = result[0].Stu_id;
        if (result[0].USN === usn && result[0].Password === password) {
            mysql.query(cmpQuery, (error, result1) => {
                mysql.query(application, id, (error, result2) => {
                    if (error) throw error;
                    res.render('studentHome', { result, company: result1, applicationRes: result2, message: true })
                })

            })
        }
        else {
            res.render('login', { message: false })
        }
    })
});

app.get('/submit-application', (req, res) => {
    const { usn, password, CMP_id, Stu_id } = req.query;
    var address = "http://localhost:" + port + "/studentHome?usn=" + usn + "&password=" + password
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
            res.render('cmpLogin');
        }
        else {
            const CMP_id = result[0].CMP_Id;
            var query1 = "select distinct S.USN,A.Status,S.Stu_id from student as S , application as A where S.Stu_id = A.Stu_id and A.Cmp_id =" + CMP_id + " group by S.USN ";
            mysql.query(query1, (error, result1) => {
                if (error) throw error;
                res.render('cmpHome', { result, students: result1 });
            })

        }
    });
})



app.get('/change_application', (req, res) => {
    const { Stu_id, status, CMP_Id } = req.query;
    var data = [status, Stu_id, parseInt(CMP_Id)];
    var query = "update application set Status = ? where Stu_id = ? and Cmp_id = ?";
    var query2 = "select * from company where CMP_Id = ?";
    mysql.query(query, data, (error, result) => {
        if (error) throw error;
        mysql.query(query2, CMP_Id, (error, result1) => {
            if (error) throw error;
            var address = "http://localhost:" + port + "/cmpHome?Cmpname=" + result1[0].CMP_Name + "&password=" + result1[0].Cmp_password;
            res.redirect(address);
        })

    })
})

app.get('/cmpSignUp', (req, res) => {
    res.render('cmpSignUp');
});
app.post('/cmpSignUp', (req, res) => {
    var { Cmpname, Role, Criteria, App_deadline, Description, Salary, Password } = req.body;
    var address = "http://localhost:" + port + "/cmpHome?Cmpname=" + Cmpname + "&password=" + Password
    var q1 = "insert into company (Cmp_Name,Role,Criteria,App_deadline,Description,Salary,Cmp_password)  values('" + Cmpname + "','" + Role + "','" + Criteria + "','" + App_deadline + "','" + Description + "','" + Salary + "','" + Password + "') ";
    mysql.query(q1, (error, result) => {
        if (error) throw error;
        res.redirect(address);
    });
})

//Running the server 
app.listen(port, () => {
    console.log(`Server connection successfull at ${port}`);
});
