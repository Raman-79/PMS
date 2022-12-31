const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const mysql = require('./sqlConnection').con;
dotenv.config();
const port = process.env.PORT;


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.listen(port, () => {
    console.log(`Server connection successfull at ${port}`);
})
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + "/public/signup.html"));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + "/public/login.html"));
})
app.get('/cmpLogin', (req, res) => {
    res.sendFile(path.join(__dirname + "/public/cmpLogin.html"));
})
app.get('/cmpSignUp', (req, res) => {
    res.sendFile(path.join(__dirname + "/public/cmpSignUp.html"));
})