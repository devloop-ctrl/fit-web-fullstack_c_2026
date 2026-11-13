import mongoose from 'mongoose';

const PostSchema=mongoose.Schema({
    email:{type:String,required:true},
    postMsg:{type:String,required:true},
    lat:{type:Number,default:null},
    lng:{type:Number,default:null},
    likes:{users:{type:[String],default:[]}},
    comments:{users:{type:[String],default:[]}},
});

const PostModel=mongoose.model("Posts",PostSchema,"Posts");
export default PostModel;