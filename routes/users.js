const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

//update user
router.put("/:id", async(req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);

            } catch(err) {
                return res.status(500).json(err);
            }
        }

        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Account has been updated");

        } catch(err) {
            return res.status(500).json(err);
        }

    } else {
        return res.status(403).json("you can only update your account");
    }
})

//delete user
router.delete("/:id", async(req, res) => {
    if(req.body.userId === req.params.id || req.body.isAdmin){
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");

        } catch(err) {
            return res.status(500).json(err);
        }

    } else {
        return res.status(403).json("you can only delete your account");
    }
})

//get user
router.get("/", async(req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId 
            ? await User.findById(userId) 
            : await User.findOne({username: username});
        const { password, ...others } = user._doc;
        res.status(200).json(others);
    } catch(err) {
        res.status(500).json(err);
    }
});

//get all users
router.get("/all", async(req, res) => {
    try {
       const allUsers = await User.find({});
       res.status(200).json(allUsers);

    } catch(err) {
        res.status(500).json(err);
    }
})

//get friends
router.get("/friends/:userId", async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followings.map((friendId) => {
                return User.findById(friendId);
            })
        );
        let friendList = [];
        friends.map((friend) => {
            const { _id, username, gender, isOnline, followers, followings, profilePicture } = friend;
            friendList.push({ _id, username, gender, isOnline, followers, followings, profilePicture });
        });
        res.status(200).json(friendList);

    } catch(err) {
        res.status(500).json(err);
    }
})

// get birthday friends
router.get("/birthdayfriends/:userId", async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followings.map((friendId) => {
                return User.findById(friendId);
            })
        );
        let friendList = [];
        friends.map((friend) => {
            const { _id, username, dob, gender, isOnline, followers, followings, profilePicture } = friend;
            friendList.push({ _id, username, dob, gender, isOnline, followers, followings, profilePicture });
        });
        res.status(200).json(friendList);

    } catch(err) {
        res.status(500).json(err);
    }
})

//follow user
router.put("/:id/follow", async(req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if(!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId }});
                await currentUser.updateOne({ $push: { followings: req.params.id }});

                res.status(200).json("user has been followed");

            } else {
                res.status(403).json("you already follow this user");
            }

        } catch(err) {
            res.status(500).json(err);
        }

    } else {
        res.status(403).json("you can't follow yourself");
    }
})

//unfollow user
router.put("/:id/unfollow", async(req, res) => {
    if(req.body.userId !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);

            if(user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId }});
                await currentUser.updateOne({ $pull: { followings: req.params.id }});

                if(user.followings.includes(currentUser._id)) {
                    await user.updateOne({ $pull: { followings: req.body.userId }});
                }

                if(currentUser.followers.includes(user._id)) {
                    await currentUser.updateOne({ $pull: { followers: req.params.id }});
                }


                res.status(200).json("user has been unfollowed");

            } else {
                res.status(403).json("you dont follow this user");
            }

        } catch(err) {
            res.status(500).json(err);
        }

    } else {
        res.status(403).json("you can't unfollow yourself");
    }
})


module.exports = router;