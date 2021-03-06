const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    friendUserId : {
        type: String,
        default: null,
    },
    friendUserName: {
        type: String,
        default: "",
    },
    desc: {
        type: String,
        max: 500
    },
    img: {
        type: String
    },
    likes: {
        type: Array,
        default: []
    },
    comments: {
        type: Array,
        default: []
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);