const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

const User = require("../models//MornarKorisnici");


module.exports = function(passport){
    passport.use(
        new LocalStrategy({ usernameField: "email" }, (email,password,done) => {
            // Match user 
            let query = {email:email};
            User.findOne(query)
            .then(user => {
                
                if(!user){
                    return done(null,false, { message: "That email is not registered"});
                }
                bcrypt.compare(password,user.password, (err,isMatch) => {
                    if(err) throw err;
                    
                    if(isMatch){
                        return done(null,user);
                    }else{
                        return done(null,false, {message: "Password incorrect"});
                    }
                })
            })
            .catch(err => console.log(err))
        })
    );
    passport.serializeUser( (user, done) => {
        done(null, user);
      });
      
    passport.deserializeUser( (user, done) => {
          
          done(null, user);
          

          
    });
}