import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    userType : {
        type : String,
        enum : ["general", "trainer"],
        default : "general"
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
        default : 0
    },
    gender : {
        type : String,
        enum: ["male", "female", "prefer_not_to_say"],
        default : "male"
    },
    height : {
        type : Number,
        default : 0
    },
    weight : {
        type : Number,
        default : 0
    },
    phone : {
        type : String,
        default : ""
    },
    address : {
        type : String,
        default : ""
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