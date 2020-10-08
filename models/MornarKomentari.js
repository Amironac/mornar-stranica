// Poslije uploadovanja slika

const mongoose = require("mongoose");


const DojamSchema = mongoose.Schema({
    check:{
        type: String,
        required: true
    },
    
    text:{
        type: String,
        required: true
    }

})


const Dojam = mongoose.model("mornarcomment", DojamSchema)

module.exports = Dojam;