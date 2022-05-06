const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const userService = require("./userService");
require("dotenv").config();

const signup = async(req,res)=>{
    try{
        const { name,email,password,roles } = req.body;

        const hashedPassword = await bcrypt.hash(password,10);

        let user = { 
            name,email,hashedPassword,roles
        }

        const response = await userService.signupUser(user);

        const { data:userId, error } = response;
        if(error) {
            throw error;
        }
        
        res.status(202).json({
            success: 1,
            message : "User Created Successfully"
        });

    }catch(err){
        res.status(400).json({
            success: 0,
            message: err?.message || err
        });
    }
}

const login = async(req, res) => {
    try{
        const {username, password} = req.body;

        let userData = {
            email : username,
            password : password
        };

        const response = await userService.loginUser(userData);
       
        const {data:userId, error}  = response || {};
        if(error) {
           throw error;
        }

        const accessToken = jwt.sign({ username, userId }, process.env.ACCESS_TOKEN_SECRET);

        res.status(202).json({
            success : 1,
            message : "User loggedin successfully.", 
            accessToken : accessToken
        }); 
    }
    catch(err){
        res.status(400).json({
            success: 0,
            error: err.message
        });
    }
}

const deleteUser = async(req,res)=>{
    let userData = {
        userId : req.user.userId,
        deleteUserEmail : req.body.email
    };

    try {
        console.log(userData);
        const response = await userService.deleteUserByAdmin(userData);
        console.log(response)
        const {data, error} = response;
        if(error) {
            throw error;
        }
        res.status(200).json({
            success: 1,
            error: data,
            message: "User deleted successfully!"
        });
    } catch (err) {
        res.status(500).json({
            success: 0,
            error: err?.message || err
        });
    }
}

module.exports = {
    signup,
    login,
    deleteUser
}