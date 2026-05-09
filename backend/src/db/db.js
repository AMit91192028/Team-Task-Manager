const mongoose = require("mongoose");

async function connectToDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB connected successfully`)
    }
    catch(error){

        console.log('Error is database connection', error)
    }
}

module.exports = connectToDB;
