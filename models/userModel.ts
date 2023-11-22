import { Schema,models,model } from "mongoose";
import ItemSchema from "./itemSchema";

export const UserSchema = new Schema({
    "id":{
        type:String,
        required:true,
        unique:true
    },
    "username":{
        type: String,
        required: true,
        unique: true
    },
    "password":{
        type: String,
        default:null
    },
    "image":{
        type: String,
        default:null
    },
    "vault":[ItemSchema]
})

const User = models.User || model("User",UserSchema);
export default User;