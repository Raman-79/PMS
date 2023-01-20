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
        var query3 = "select S.USN,C.CMP_Name,A.Status from student S ,company C ,application A where S.Stu_id = A.Stu_id and C.Cmp_id = A.Cmp_id;"
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

app.get('/update-form', (req, res) => {
    res.render('update_form')
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


    var application = "select A.Status,C.CMP_Name from application as a , company as c where A.Stu_id = ? and A.Status = ? and A.Cmp_id = C.CMP_Id";
    var application2 = "select distinct A.Status,C.CMP_Name from application as a , company as c where A.Stu_id = ? and A.Status = ? and A.Cmp_id = C.CMP_Id";
    mysql.query(query, [usn, password], (error, result) => {
        if (result[0].USN === usn && result[0].Password === password) {
            mysql.query(cmpQuery, (error, result1) => {

                if (error) throw error;
                res.render('studentHome', { result, company: result1 })

                mysql.query(application, [id, 'Accepted'], (error, result2) => {
                    mysql.query(application, [id, 'Rejected'], (error, result3) => {
                        mysql.query(application2, [id, 'Pending'], (error, result4) => {
                            if (error) throw error;
                            res.render('studentHome', { result, company: result1, applicationRes: result2, rejectApp: result3, pendingApp: result4, message: true })
                        })

                    })

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
            res.render('cmpLogin', { message: false });
        }
        else {
            const CMP_id = result[0].CMP_Id;
            var query1 = "select S.USN,A.Status,S.Stu_id from student as S , application as A where S.Stu_id = A.Stu_id and A.Cmp_id =" + CMP_id;
            mysql.query(query1, (error, result1) => {
                if (error) throw error;
                res.render('cmpHome', { result, students: result1, message: true });
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

app.listen(port, () => {
    console.log(`Server connection successfull at ${port}`);
});
