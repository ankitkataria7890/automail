const sendEmail = require("./index.js");
// reciver info
const reciever={
    subject: "Test",
    text: "I am sending an email from nodemailer!",
    to: "reciever _mail",
    from: process.env.EMAIL
}
// send function which import from .index.js file
sendEmail();

