const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");


const app = express();
app.use(express.json());

const {userRouter} = require("./routes/user");
const {contentRouter} = require("./routes/content");

app.use("/api/v1/user", userRouter);
app.use("/api/v1/content", contentRouter);

const mongoUrl = process.env.MOngo_Connection_String;

async function connectToDatabase() {
    try{
        await mongoose.connect(mongoUrl).then(()=>{console.log("Connected to MongoDB")});
    }
    catch(err){
        console.log("Error connecting to MongoDb");
    }

    app.listen(3000,()=>console.log("Serving running on port 3000"));
}

connectToDatabase();

