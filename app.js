const express = require("express");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const session =  require("express-session");
const handle= require("handlebars");
const flash = require("connect-flash")

const {allowInsecurePrototypeAccess} = require("@handlebars/allow-prototype-access");

const methodOverride = require("method-override");

const mongoose = require("mongoose");
const db = require("./config/Mongo").MongoURI;

mongoose.connect(db, {useUnifiedTopology: true})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err))

const app = express();

require("./config/passport")(passport);


app.set("view engine", "handlebars");
app.engine("handlebars", exphbs({defaultLayout: "main",
  handlebars: allowInsecurePrototypeAccess(handle)
  
}));

app.use(express.static(path.join(__dirname,"public")));

app.use(bodyParser.json());
app.use(methodOverride("_method"))
app.use(bodyParser.urlencoded({extended: false}));


app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true,
     
    })
  );
app.use(flash());
app.use( (req,res,next) => {

  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next()

})

app.use(passport.initialize());
app.use(passport.session());

app.get("/dashboard", (req,res) => res.sendFile(path.join(__dirname,"public","indexhtml.html")))
app.use("/", require("./routes/Routes"));
app.get("/get" , (req,res) => res.sendFile(path.join(__dirname,"public","landing.html")))


app.listen(3000, console.log("Server started on port: 3000"))

