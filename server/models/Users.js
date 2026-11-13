import mongoose from 'mongoose';

const UserSchema=mongoose.Schema({
    email:{type:String,required:true,unique:true},
    uname:{type:String,required:true},
    password:{type:String,required:true},
    profile:{type:String},
});

const UserModel=mongoose.model("Users",UserSchema,"Users");
export default UserModel;