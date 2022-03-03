require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        rejectUnauthorized: false
    }
});

function sendEmail(emailIDs, content)
{
    const mailOptions = {
        from: process.env.EMAIL,
        to: emailIDs,
        subject: 'Leetcode Daily Challenge',
        html: content
    };
    
    transporter.sendMail(mailOptions, (err, info) => {
        if(err){
            // console.log(err);
        }
        else{
            // console.log(info);
        }
    });

}



module.exports = {sendEmail};