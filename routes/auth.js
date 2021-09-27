const router = require("express").Router();
const bcrypt = require("bcrypt");

const User = require("../models/User");


//REGISTER USER
router.post("/register", async(req, res) => {
    try {
        //generate hashed password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            dob: req.body.dob,
            gender: req.body.gender,
            password: hashedPass,
        })

        const user = await newUser.save();
        res.status(200).json(user);

    } catch(err) {
        res.status(500).json(err);
    }
});

//LOGIN
router.post("/login", async(req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});
        !user && res.status(404).json("user not found");

        const validPass = await bcrypt.compare(req.body.password, user.password);
        !validPass && res.status(400).json("wrong password");

        res.status(200).json(user);

    } catch(err) {
        res.status(500).json(err);
    }
})

//CONFIRM USER FOR PASSWORD CHANGE
router.post("/confirmuser", async(req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});
        !user && res.status(404).json("user not found");
        
        res.status(200).json(user);

    } catch(err) {
        res.status(500).json(err);
    }  
})

module.exports = router;