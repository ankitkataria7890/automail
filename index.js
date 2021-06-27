// dotenv file contian sensitive info such as {sender mail, refresh_token, access_token,client_secret,client_id}
//to access variable declared in dotenv file :  process.env.variable_name
require('dotenv').config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );
  
    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN
    });
  
    // const accessToken = await new Promise((resolve, reject) => {
    //     try{
    //         oauth2Client.getAccessToken((err, token) => {
    //             if (err) {
    //               reject();
    //             }
    //             else
    //             resolve(token);
    //           });
    //     }
    //     catch (error) {
    //         console.error(error);
    //       }
      
    // });
    const accessToken=process.env.ACCESS_TOKEN
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        accessToken,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
      }
    });
    return transporter;
};
const sendEmail = async (emailOptions) => {
    let emailTransporter = await createTransporter();
    await emailTransporter.sendMail(emailOptions);
  };
  module.exports=sendEmail;
  