require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const md5 = require('md5');
const CronJob = require('cron').CronJob;
const {sendEmail} = require('./scripts/email/email');
const leetcodeDailyChallenge = require('./scripts/leetcode_daily_challenge');


// express app setup
const app=express();
app.listen(process.env.PORT || 3000);

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');


// database connection
mongoose.connect(process.env.MONGODB_URL);

const tempUserSchema = new mongoose.Schema({
    email: String,
    hash: String,
    TTLSec: Date
}, {versionKey: false})
const userSchema = new mongoose.Schema({
    email: String
}, {versionKey: false})

const tempUser = new mongoose.model("tempUsers", tempUserSchema, "tempUsers");
const User = new mongoose.model("User", userSchema);


// app routing

app.get("/", function (req,res){
    res.render('leetmail');
});

app.post("/subscribe", function(req,res){
    
    const email = req.body.email;
    const hash = md5(email);

    const temp_user = new tempUser({email: email, hash: hash, TTLSec: new Date()});
    temp_user.save((err, data)=> {
        if(!err){
            const verifyUrl = "<a href=\"http://"+req.headers.host+"/verify/?id="+hash+"\">link to verify your email</a>";
            const content = "<h1 style=\"text-align:center\">LeetMail</h1><p>Please use below link to verify your email address for LeetMail subcribtion.</p><p>*This link is valid only for 60 minutes.</p>"+verifyUrl;
            sendEmail(email, content);
    
            res.send("*Please, check your mail and verify your email address.");
        }
        else  res.send("Error try again.");
    });

});

app.get("/verify", function (req,res){

    const hash = req.query.id;

    tempUser.findOneAndDelete({hash: hash}, {projection: {email: 1, _id:0}}, (err, temp_user) => {
        if(!err && temp_user){
            const verified_email = temp_user.email;

            const user = new User({email: verified_email});
            user.save((err, data) => {
                if(!err){
                    res.render('message', {title: "Successfully Subscribed", message: "Successfully Subscribed"});
                }
                else res.render('message', {title: "ERROR: Try Again", message: "something went wrong try again."});
            });
        }
        else{
            res.render('message', {title: "ERROR: Try Again", message: "something went wrong try again."});
        }
    })

});


// Cron Job to schedule Leetcode Daily Challenge email notifications.
// @ 06:00:00 AM daily 
// cron time => "0 0 6 * * *"

const job = new CronJob('0 0 6 * * *', function() {
    
    User.find({}, {email:1, _id:0}, (err, users) => {

        if(!err && users.length > 0){

            const emailIDs=[];
            users.forEach(user => {
                emailIDs.push(user.email);
            });

            leetcodeDailyChallenge((content) => {
                sendEmail(emailIDs, content);
            });
        }
    })

}, null, true, 'Asia/Kolkata');





