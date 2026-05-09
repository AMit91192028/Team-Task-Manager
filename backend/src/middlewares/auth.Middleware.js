const jwt = require('jsonwebtoken');
const User = require("../models/User.model");

async function authMiddleware(req,res,next){
        const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];
        if(!token){
            return res.status(401).json({message:"Unauthorized"});
        }

        try{
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            const user = await User.findById(decode.id).select("name email role");

            if (!user) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            req.user = user;
            next();
        }
        catch(error){
            return res.status(401).json({message:"Unauthorized"});
        }
}

module.exports={authMiddleware}
