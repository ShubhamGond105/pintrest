const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/pintrest');

const userSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  contact: {
    type: String,
    trim: true
  },
  profileImage: {
    type: String,
    default: 'default-image.jpg'
  },
  boards: {
    type: Array,
    default: []
  },
  posts:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    }
  ]
});

userSchema.plugin(plm);

module.exports = mongoose.model('User', userSchema);
