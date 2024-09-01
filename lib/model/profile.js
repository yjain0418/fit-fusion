import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    userType : {
        type : String,
        enum : ["User", "Trainer"],
        required : true
    },
    email : {
        type : String,
        minLength : 12,
        required : true,
        lowercase : true,
        unique : true
    },
    age : {
        type : Number,
        required : true
    },
    gender : {
        type : String,
        enum: ["male", "female", "prefer_not_to_say"],
        required : true
    },
    height : {
        type : Number,
        required : true
    },
    weight : {
        type : Number,
        required : true,
    },
    phoneNo : {
        type : String,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    coins : {
        type : Number,
        default : 0
    },
    reward : {
        type : String,
        default : ""
    },
    designation : {
        type : String,
    },
    experience : {
        type : Number
    }
}, { versionKey : false })

export const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);