import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        minLength : 12,
        required : true,
        lowercase : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    }
}, {timestamps : true, versionKey : false})

export const User = mongoose.models.users || mongoose.model("User", userSchema);