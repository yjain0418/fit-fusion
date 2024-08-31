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
        type : int,
        required : true
    },
    gender : {
        type : string,
        enum: ["male", "female", "prefer_not_to_say"],
        required : true
    },
    height : {
        type : int,
        required : true
    },
    weight : {
        type : int,
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
    designation : {
        type : String,
    },
    experience : {
        type : int
    }
}, { versionKey : false })

export const Profile = mongoose.models.Profile || mongoose.model("Profile", profileSchema);