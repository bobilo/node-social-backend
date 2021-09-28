const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

//create a post
router.post("/", async(req, res) => {
    const newPost = new Post(req.body)

    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);

    } catch(err) {
        res.status(500).json(err);
    }
})

//update a post
router.put("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId) {
            await post.updateOne({
                $set: req.body
            });
            res.status(200).json("post updated successfully");

        } else {
            res.status(403).json("you can update only your post");
        }

    } catch(err) {
        res.status(500).json(err);
    }
    
})

//delete a post
router.delete("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).json("post deleted successfully");

        } else {
            res.status(403).json("you can delete only your post");
        }

    } catch(err) {
        res.status(500).json(err);
    }
    
})

//like a post
router.put("/:id/like", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("The post has been liked");

        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("The post has been unliked");
        }

    } catch(err) {
        res.status(500).json(err);
    }
})

//comment on a post
router.put("/:id/comment", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
            const comment = {};
            comment[req.body.username] = req.body.comment;
            await post.updateOne({ $push: { comments: comment } });
            res.status(200).json("Comment have been posted");

        } catch(err) {
            res.status(500).json(err);
    }
})


//get a post
router.get("/:id", async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);

    } catch(err) {
        res.status(500).json(err);
    }
})

// post on friend's timeline
router.post("/timeline", async(req, res) => {
    try {
        const currentUser = await User.findById(req.body.friendUserId);
        const friend = await User.findById(req.body.userId);

        if(currentUser.followings.includes(friend._id) && currentUser.followers.includes(friend._id)) {
            const newPost = new Post(req.body)
            try {
                const savedPost = await newPost.save();
                res.status(200).json(savedPost);
        
            } catch(err) {
                res.status(500).json(err);
            }
        }
    } catch(err) {
        res.status(500).json(err);
    }
})
// get all posts
router.get("/", async(req, res) => {
    try {
       const allPosts = await Post.find({});
       res.status(200).json(allPosts);

    } catch(err) {
        res.status(500).json(err);
    }
})

//get timeline posts
router.get("/timeline/:userId", async(req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ userId: friendId });
            })
        );
        res.status(200).json(userPosts.concat(...friendPosts))

    } catch(err) {
        res.status(500).json(err);
    }
})

//get user's all posts
router.get("/profile/:username", async(req, res) => {
    try {
         const user = await User.findOne({username:req.params.username});
         const posts = await Post.find({userId:user._id});
         const allPosts = await Post.find({});
         const friendsPosts = await Promise.all(
            allPosts.map((post) => {
                if(post.friendUserId == user._id){
                    return Post.find({ userId: post.userId }); 
                }
             })
         )
         res.status(200).json(posts.concat(...friendsPosts));

    } catch(err) {
        res.status(500).json(err);
    }
})

module.exports = router;