const router = require("express").Router();
const User = require("../models/User");
const CryptoJS  = require("crypto-js");
const { enc } = require("crypto-js");
const jwt = require("jsonwebtoken");


//REGISTER User
router.post("/register", async (req,res) =>{
    const newUser = new User({
        username: req.body.username,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SEC).toString(),
        email: req.body.email,
          
        });


    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);

        
    
    } catch (err) {
        res.status(500).json(err);
    
    } 
     
});

//LOGIN
router.post("/login", async (req, res)=>{
    try {

        const user = await User.findOne({username: req.body.username});
        !user && res.status(401).json("Wrong credentials!");


        const hash = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
        const Originpassword = hash.toString(CryptoJS.enc.Utf8);

        Originpassword !== req.body.password && res.status(401).json("Wrong crendentials");
 
        const token = jwt.sign({
            id: user._id,
            IsAdmin: user.IsAdmin,
        },

            process.env.JWT_SEC,
            {expiresIn: "1d"}
               );

        const {password, ...others} = user._doc;
    
        res.status(200).json({...others, token});

    } catch (err) {
          res.status(500).json(err);
    }
   
});


module.exports = router;