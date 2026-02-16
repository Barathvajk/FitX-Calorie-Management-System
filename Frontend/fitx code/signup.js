const mysql=require("mysql");
const express=require("express");
const bodyparser=require("body-parser");
const encoder=bodyparser.urlencoded();
const app=express();

const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"mysqlworkbench24",
    database:"mydb"
});

connection.connect(function(error) {
    if (error) {
        throw error;
    }
    console.log("Connected Successfully");
 });
 
app.get("/",function(req,res){
    res.sendFile(__dirname + "/Login.html");
})

app.post("/", encoder, function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    connection.query("INSERT INTO loginuser WHERE user_name= ? AND user_pass = ?", [username, password], function(error, results, fields) {
        if (error) {
            console.error("Error executing SQL query:", error);
            res.status(500).send("Internal Server Error");
            return;
        }

        if (results.length > 0) {
            res.redirect("/welcome");
        } else {
            res.redirect("/");
        }
        res.end();
    });
});




app.get("/welcome",function(req,res){
    res.sendFile(__dirname + "/welcome.html")
})

app.listen(4000);