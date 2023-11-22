import { Schema } from "mongoose";

const loginSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  uri: {
    type: String,
  },
});

const ItemSchema = new Schema({
  creationDate: {
    type: Date,
    default: Date(),
  },
  updatedDate: {
    type: Date,
    default: null,
  },
  organization: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  favourite: {
    type: Boolean,
    required: true,
  },
  notes: {
    type: String,
    required: false,
  },
  login: loginSchema,
});

export default ItemSchema;
