const mongoose = require("mongoose");

const db = require("../config/Mongo");

const UserSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true
    },
    lastname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
   
    gender:{
        type: String,
        required: true
    },
    ethnicity:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    file:{
        type: String,
        required: true
    }

   
});

const User = mongoose.model("MornarUser" , UserSchema);

module.exports = User;