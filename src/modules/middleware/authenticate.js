const jwt = require("jsonwebtoken");
require('dotenv').config()

const authenticateToken = (req,res,next) => {
    try{
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if(token == null){
            return res.status(401).json({message: 'Invalid token'});
        }
    
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,userDetails) => {
            if(err){
                return res.sendStatus(403);
            }
            req.user = userDetails;
            next();
        })
    }catch(err){
        res.status(401).json({
            success: 0,
            message: "Invalid email id or password!"
        })
    }
}

module.exports = {
    authenticateToken
}