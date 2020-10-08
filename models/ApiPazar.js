var mongoose = require("mongoose");


var Money = new mongoose.Schema({
    pazar:{
        type: Number,
        required: true
    }
})

module.exports = mongoose.model("mornarpazar", Money);