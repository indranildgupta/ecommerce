const pool = require("../../config/dbConfig");

const roleCheckHelper = async (userId) => {
    return pool.query("SELECT roles FROM project.user WHERE id= $1", [userId]);
};

const getUserByEmail = async (email) => {
    return pool.query("SELECT * FROM project.user WHERE email = $1", [String(email)]);
};

const getUserIdByEmail = async(email) => {
    return pool.query("SELECT id FROM project.user WHERE email = $1", [String(email)]);
};

const registerNewUser = async (user) => {
    const { name, email, hashedPassword, roles } = user;
    try {
      await pool.query(
        "INSERT INTO project.user(name,email,password,roles) VALUES($1,$2,$3,$4)",  [String(name), String(email), String(hashedPassword), roles]
      ) 
    } catch (err) {
      throw new Error("Problem inserting in database!");
    }
};

const deleteUserByEmail = async (deleteUserEmail) => {
    try {
      await pool.query("DELETE FROM project.user WHERE email= $1", [deleteUserEmail]);
    } catch (err) {
      throw new Error("Database Error! Problem deleting given user...");
    }
};

module.exports = {
    getUserByEmail,
    getUserIdByEmail,
    registerNewUser,
    deleteUserByEmail,
    roleCheckHelper
}