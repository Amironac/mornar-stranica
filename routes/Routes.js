const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs")


const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const crypto = require("crypto");
const multer = require("multer");
const mongoose = require("mongoose");
const db = require("../config/Mongo").MongoURI;
const path = require("path");


let conn = mongoose.createConnection(db);
let gfs;
conn.once("open",function () {
  // init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("mornarpictures");
})

const storage = new GridFsStorage({
  url: db,
  file: (req,file) => {
    return new Promise((resolve,reject) => {
      crypto.randomBytes(16,(err,buf) => {
        if(err){
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "mornarpictures"
        };
        resolve(fileInfo);
      })
    })
  }
})
const upload = multer({storage});
router.post("/upload" , upload.single("file"),(req,res)=>{
  // res.json({file: req.file});
  res.redirect("/gallery");
})

const Pazar = require("../models/ApiPazar");

router.post("/add_files", (req,res) => {
    let {pazar} = req.body;

    let newPazar = new Pazar({
        pazar
    })

    newPazar.save().then(() => res.redirect("/files")).catch(err => console.log(err));

})
router.get("/files" , (req,res) => {
    gfs.files.find().toArray((err,files) => {
        // Check if files 
        if(!files || files.length === 0){
            return res.status(404).json({
                err: "No files exist"
            })
        }
        
        files.forEach(file =>{
            JSON.stringify(file);
        })
        res.render("API", {files})
    })
})
router.get("/files/all_files" , (req,res) => {
    gfs.files.find().toArray((err,files) => {
        // Check if files 
        if(!files || files.length === 0){
            return res.status(404).json({
                err: "No files exist"
            })
        }
        
        return res.json(files);
    })
})

// Get files/:filename
// Display single file
router.get("/files/:filename" , (req,res) => {
    gfs.files.findOne({filename: req.params.filename}, function (err,file) {
        if(!file || file.length === 0){
            return res.status(404).json({
                err: "No files exist"
            })
        }
        // File exists

        return res.json(file);
    })
})

// Get image/:filename
// Display image
router.get("/image/:filename" , (req,res) => {
    gfs.files.findOne({filename: req.params.filename}, function (err,file) {
        if(!file || file.length === 0){
            return res.status(404).json({
                err: "No files exist"
            })
        }
        // Check if image

        if(file.contentType ==="image/jpeg" || file.contentType ==="img/png"){
            // Read output to browser
            let readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);

        }else{
            res.status(404).json({
                err: "Not an image"
            })
        }
    })
})

router.get("/gallery", (req, res) =>{
    gfs.files.find().toArray((err,files) => {
        // Check if files 
        if(!files || files.length === 0){
            res.render("gallery", {files: false})
        }else{
            files.map(file => {
                if(file.contentType ==="image/jpeg" || file.contentType ==="image/png"){
                    file.isImage = true;
                }else{
                    file.isImage = false;
                }
            })
            res.render("gallery",{files:files});
        }

        
    })
} );

router.get("/contact", (req,res) => res.render("contact"))

const Reg = require("../models/MornarKorisnici");

let {
    ensureAuthenticated,
    fowardAuthenticated
} = require("../config/auth");
// Prebaciti na blog ako je login uspjesan

let Comm = require("../models/MornarKomentari");
router.get("/", (req, res) => res.render("index"));
router.get("/about", (req, res) =>{

    Comm.find({},function (err,result) {
        if(err) throw err;
        res.render("about",{result})
        
    })
 
});
router.get("/prijavi_se", (req, res) => res.render("login"));



// Za blog
router.get("/blog" ,ensureAuthenticated, (req,res) =>{
    
    gfs.files.find().toArray((err,files) => {
        
        
            res.render("blog",{user: req.user,files:files})
            
       

        
    })
    
    // Comm.find({},function (err,result) {
    //     if(err) throw err;
    //     res.render("blog",{user: req.user, result})
        
    // })
 
})


// Za registraciju
router.get("/dojam" , (req,res) => res.render("register"))
router.post("/dojam" , upload.single("file") ,(req,res) =>{
    let {firstname,lastname,email,password,confirmpwd , gender,ethnicity,
    address,phone} = req.body;
    let errors = [];
    
    if(!firstname || !lastname || !email || !password || ! confirmpwd || !gender ||
        !ethnicity || !address || !phone){
            errors.push({msg: "Molimo popunite sva polja"})
        }
    if(password !== confirmpwd){
        errors.push({msg: "Passwordi se razlikuju"})
    }
    if(password.length < 8) {
        errors.push({msg: "Password bi trebao biti najmanje 8 znakova"});
    }
    if(errors.length > 0) {
        res.render("register" , {
            errors
        })
    }else{
        Reg.findOne({email:email})
    .then(items => {
        if(items){
            console.log("Taj korisnik je vec registrovan")
            errors.push({msg: "Taj korisnik je vec registrovan"})
            res.render("register" , {errors})
        }else{
            const newReg = new Reg({
                firstname,
                lastname,
                email,
                password,
                
                gender,
                ethnicity,
                address,
                phone,
                file:req.file
            })
            
            bcrypt.genSalt(10,(err,salt) => 
            bcrypt.hash(newReg.password, salt, (err,hash) =>{
                if (err) throw err;

                newReg.password = hash;
                
                newReg.save()
                .then(() =>{
                    req.flash("success_msg", "Sada ste registrovani i možete se prijaviti na blog")
                    res.redirect("/prijavi_se")
                    console.log("User saved !");
                })
                .catch(err => console.log(err))
            } ))
            
        }
    })
    }
    
})

router.get("/propratna_poruka" ,(req,res) => res.render("thanks"));
// Za dodavanje dojma
router.post("/add" , (req,res) => {
    let { check , text}= req.body;
    let errors = [];

    if(!check || !text){
        errors.push({msg: "Molimo popunite sva polja"})
        res.render("blog" , {
            errors,
        })
    }else{
        let newCom = new Comm({
            check,
            text,
        })
        newCom.save().then(() => {
            
            res.redirect("/propratna_poruka")
        })
        .catch(err => console.log(err));

       

    }
})

router.post("/prijavi_se", (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/blog",
        failureRedirect: "/prijavi_se",
        failureFlash:true
    })(req, res, next);
})


router.get("/odjavi_se", (req, res) => {
    req.logout();
    req.flash("success_msg", "Uspjesno ste odjavljeni")
    res.redirect("/prijavi_se")
    
})
module.exports = router;