require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var findOrCreate = require('mongoose-findorcreate');
const path = require('path');
const bodyParser = require('body-parser')

//port
const port = process.env.PORT || 8800;

//path
const static_path = path.join(__dirname, '/public');
//const template_path=path.join(__dirname,'/templates/views');

//set engine
const app = express();
app.set('view engine', 'ejs');
//app.set('views',template_path);
app.use(express.static(static_path));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

app.use(session({
  secret: 'our little secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
const urll = 'mongodb+srv://admin-rupesh:Rupesh12345@cluster0.lcgjc.mongodb.net/userDB?retryWrites=true&w=majority'
//const urll='mongodb+srv://admin:Luv2laf!!@cluster0.73s1h.mongodb.net/db_recipie?retryWrites=true&w=majority'
mongoose.connect(urll, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
//changes here create schema
const userSchema = new mongoose.Schema({
  userid:String,
  name:String,
  email: String,
  photo:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:8800/auth/google/secrets"
  //passReqToCallback   : true
  //userProfileURL : "http://www.googleapis.com/oauth2/v3/userinfo"
},
  function (accessToken, refreshToken, profile, done) {
    console.log(typeof profile.id)
    console.log(profile.emails[0].value);
    //console.log(profile);
    //changes here instead of google id ->userid in findOne
    User.findOne({ 'userid': profile.id }, function (err, user) {
      if(err){
        return done(err);
      }
      console.log(user)
      //check for whether user present or not
      if(!user){
        user=new User({
          userid:profile.id,
          username:profile.displayName,
          email:profile.emails[0].value,
          photo:profile._json.picture
        });
        user.save((err)=>{
          if(err) console.log("not saved");
          return done(err,user);
        });
      }
      else {
        return done(err,user);
      }
    });
  }
));

//mail object
const sendEmail = require("./sendmail.js");
//reciver info

//send function which import from .index.js file


//get route

app.get("/", (req, res) => {
  return res.render("about");
});
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile","email"] }));

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/automail");
  });

app.get("/login", (req, res) => {
  return res.render("login");
});

app.get("/signup", (req, res) => {
  return res.render("signup");
});
app.get("/automail", (req, res) => {
  if (req.isAuthenticated())
    res.render("automail");
  else
    res.redirect("/login");
});
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
})
app.post("/signup", (req, res) => {

  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/signup");
    }
    else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/automail");
      });
    }
  });
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function (err) {
    if (err)
      console.log(err);
    else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/automail");
      });
    }
  });
});

app.post("/info", (req, res) => {
  //let xcel = req.body.hiddenField 
  let from = req.body.from
  let cc = req.body.cc
  let subject = req.body.subject;
  let body = req.body.body;
  let str = "chefaura7890@gmail.com"
 // console.log(xcel)
  let xcel=req.body.hiddenField
  console.log(xcel)
  
  
  // for(let i=0;i<xcel.length;i++){
  //   // str = str + ',' + xcel[i];
  //   console.log(xcel[i])
  // }
  // let str = "chefaura7890@gmail.com"
  // function fun(item) {
  //   if (item.length) {
  //     str = str + ',' + item[0];
  //   }
  // }
  let reciever = {
    subject: subject,
    text: body,
    to:xcel,
    from: process.env.EMAIL
  }
  try {
    sendEmail(reciever)
    res.send('<script>alert("VERIFICATION MAIL SENT TO YOUR MAIL"); window.location.href = "/automail"; </script>');
  }
  catch (err) {
    console.log(err)
    res.send('<script>alert("ERROR IN YOUR CREDENTIALS \nPLEASE FILL CORRECT CREDENTIALS"); window.location.href = "signup"; </script>');
  }

})


app.listen(port, () => {
  console.log('listening to port hii at')
})



// app.get('/',(req,res)=>{
//     res.render('about');

// })
// app.get('/login',(req,res)=>{
//     res.render('login');
// })
// app.get('/signup',(req,res)=>{
//     res.render('signup');
// })

// //post route
// app.post('/signup',(req,res)=>{
//     console.log(req.body)
//     let email=req.body.email
//     let reciever={
//         subject: "Welocome",
//         text: "I am sending an email from nodemailer!",
//         to: email,
//         from: process.env.EMAIL
//     }
//     try{
//         sendEmail(reciever)
//         res.send('<script>alert("VERIFICATION MAIL SENT TO YOUR MAIL"); window.location.href = "/login"; </script>');
//     }
//     catch(err){
//         console.log(err)
//         res.send('<script>alert("ERROR IN YOUR CREDENTIALS \nPLEASE FILL CORRECT CREDENTIALS"); window.location.href = "signup"; </script>');
//     }
// })
// app.post('/login',(req,res)=>{
//     res.redirect('automail')
// })



// app.listen(port,()=>{
//     console.log('listening to port hii at')
// })
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var findOrCreate = require('mongoose-findorcreate');
const path = require('path');
const bodyParser = require('body-parser')

//port
const port = process.env.PORT || 8800;

//path
const static_path = path.join(__dirname, '/public');
//const template_path=path.join(__dirname,'/templates/views');

//set engine
const app = express();
app.set('view engine', 'ejs');
//app.set('views',template_path);
app.use(express.static(static_path));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

app.use(session({
  secret: 'our little secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
const urll = 'mongodb+srv://admin-rupesh:Rupesh12345@cluster0.lcgjc.mongodb.net/userDB?retryWrites=true&w=majority'
mongoose.connect(urll, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:8800/auth/google/secrets"
  //userProfileURL : "http://www.googleapis.com/oauth2/v3/userinfo"
},
  function (accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

//mail object
const sendEmail = require("./sendmail.js");
//reciver info

//send function which import from .index.js file


//get route

app.get("/", (req, res) => {
  return res.render("about");
});
app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] }));

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/automail");
  });

app.get("/login", (req, res) => {
  return res.render("login");
});

app.get("/signup", (req, res) => {
  return res.render("signup");
});
app.get("/automail", (req, res) => {
  if (req.isAuthenticated())
    res.render("automail");
  else
    res.redirect("/login");
});
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
})
app.post("/signup", (req, res) => {

  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/signup");
    }
    else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/automail");
      });
    }
  });
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function (err) {
    if (err)
      console.log(err);
    else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/automail");
      });
    }
  });
});
app.get("/temp", (req, res) => {
  res.render('temp')
})
app.post("/info", (req, res) => {
  //let xcel = req.body.hiddenField
  let from = req.body.from
  let cc = req.body.cc
  let subject = req.body.subject;
  let body = req.body.body;
  let str = "chefaura7890@gmail.com"
 // console.log(xcel)
  let xcel=req.body.hiddenField
  console.log(xcel)
  
  
  // for(let i=0;i<xcel.length;i++){
  //   // str = str + ',' + xcel[i];
  //   console.log(xcel[i])
  // }
  // let str = "chefaura7890@gmail.com"
  // function fun(item) {
  //   if (item.length) {
  //     str = str + ',' + item[0];
  //   }
  // }
  let reciever = {
    subject: subject,
    text: body,
    to:xcel,
    from: process.env.EMAIL
  }
  try {
    sendEmail(reciever)
    res.send('<script>alert("VERIFICATION MAIL SENT TO YOUR MAIL"); window.location.href = "/automail"; </script>');
  }
  catch (err) {
    console.log(err)
    res.send('<script>alert("ERROR IN YOUR CREDENTIALS \nPLEASE FILL CORRECT CREDENTIALS"); window.location.href = "signup"; </script>');
  }

})


app.listen(port, () => {
  console.log('listening to port hii at')
})



// app.get('/',(req,res)=>{
//     res.render('about');

// })
// app.get('/login',(req,res)=>{
//     res.render('login');
// })
// app.get('/signup',(req,res)=>{
//     res.render('signup');
// })

// //post route
// app.post('/signup',(req,res)=>{
//     console.log(req.body)
//     let email=req.body.email
//     let reciever={
//         subject: "Welocome",
//         text: "I am sending an email from nodemailer!",
//         to: email,
//         from: process.env.EMAIL
//     }
//     try{
//         sendEmail(reciever)
//         res.send('<script>alert("VERIFICATION MAIL SENT TO YOUR MAIL"); window.location.href = "/login"; </script>');
//     }
//     catch(err){
//         console.log(err)
//         res.send('<script>alert("ERROR IN YOUR CREDENTIALS \nPLEASE FILL CORRECT CREDENTIALS"); window.location.href = "signup"; </script>');
//     }
// })
// app.post('/login',(req,res)=>{
//     res.redirect('automail')
// })



// app.listen(port,()=>{
//     console.log('listening to port hii at')
// })
