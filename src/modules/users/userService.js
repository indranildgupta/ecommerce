const pool = require("../../config/dbConfig");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const {UserRoles} = require("./../../helper/enums");


const userRepository = require("./userRepository");


const signupUser = async(user)=>{
    try{
        const userExists = await userRepository.getUserByEmail(user.email);
        if (userExists.rowCount>0) {
            return {
                data: null,
                error: "Email id already taken!"
            }
        }
    
        await userRepository.registerNewUser(user);
        let userId = await userRepository.getUserIdByEmail(user.email);
        userId = userId.rows[0].id;
        return {
            data: userId,
            error: null
        };
    }catch(err){
        return {
            data : null,
            error : err.message
        }
    }
}

const loginUser = async(userData) => {
    try{
        const {email, password} = userData;

        const isUserValid = await userRepository.getUserByEmail(email);

        if(isUserValid.rows[0]==null) {
            return {
                data: null,
                error: "Invalid user or password!"
            }
        }
        
        const isPasswordEqual = await bcrypt.compare(password, isUserValid.rows[0].password); 

        if(isPasswordEqual) {
            let userId = await userRepository.getUserIdByEmail(email);
            userId = userId.rows[0].id;
            return {
                data: userId,
                error: null
            };
        } else {
            return {
                data: null,
                error: "Invalid user or password!"
            }
        }
    }
    catch(err){
        return {
            data: null,
            error: err.message
        }
    }
}

const deleteUserByAdmin = async(userData)=>{
    try {
        const {rows} = await userRepository.roleCheckHelper(userData.userId);
        const userToBeDeletedExists = await userRepository.getUserByEmail(userData.deleteUserEmail) != null;
        const isAdmin = rows[0].roles;
        if(!userToBeDeletedExists) {
            return {
                data: null,
                error: "User to be deleted doesn't exists!"
            };
        } else if (isAdmin!=UserRoles.ADMIN) {
            return {
                data: null,
                error: "Unauthorized access! Only admin allowed.."
            }
        }
        console.log(userData.deleteUserEmail)
        await userRepository.deleteUserByEmail(userData.deleteUserEmail);
        return {
            data: userData.deleteUserEmail,
            error: null
        }
        
    } catch (err) {
        return {
            data: null,
            error: err.message
        }
    }
}

module.exports = {
    signupUser,
    loginUser,
    deleteUserByAdmin
}