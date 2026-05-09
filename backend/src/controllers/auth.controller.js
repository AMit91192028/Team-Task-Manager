const userModel = require('../models/User.model');
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
 
function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure:isProduction,
        sameSite: isProduction ? "none" : 'lax',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000
    };
}

async function registerUser(req,res){
    try {
        const{name, email,password, role} = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        const isUserAlreadyExists = await userModel.findOne({
            email: normalizedEmail
        });

        if(isUserAlreadyExists){
            return res.status(409).json({message:"An account with this email already exists"});
        }

        const hash = await bcrypt.hash(password,10);
        const assignedRole = role === "admin" ? "admin" : "member";

        const user = await userModel.create({
            name,
            email: normalizedEmail,
            password:hash,
            role: assignedRole
        })


        const token = jwt.sign({
            id:user._id,
            name:user.name,
            email:user.email,
            role:user.role
     },process.env.JWT_SECRET,{expiresIn:'1d'})

        res.cookie('token', token, getCookieOptions())

        res.status(201).json({message:"User registered successfully",
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role,
    }})
    } catch (err) {
        if (err.code === 11000 && err.keyPattern?.email) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        return res.status(500).json({ message: err.message || "Internal Server Error" });
    }
}


async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        const user = await userModel.findOne({email: normalizedEmail}).select('+password');

        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password || '');
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, getCookieOptions());

        res.status(200).json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message || "Internal Server Error" });
    }
}

async function getCurrentUser(req, res){
    const {id} = req.user;

    const user = await userModel.findById(id);
    
    if(!user){
        return res.status(404).json({message:"User not found"});
    }

    return res.status(200).json({
        message:"User profile fetched successfully",
        user:{
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    })
}



async function logoutUser(req,res){
    res.clearCookie('token', getCookieOptions());

    return res.status(200).json({message:"Logged out successfully"})
}


module.exports = { registerUser, loginUser,getCurrentUser,logoutUser }
