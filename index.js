require('dotenv').config();
const express = require('express');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require ('bcrypt');


const app = express();

app.use(express.json()) //req.body

// **************      routes       ********************************

//User API
app.get("/get-user",async(req,res) => {
    try{
        //console.log(req.body);
        const { name } = req.body;
        const user = await pool.query(
            `select email from project.user where name = $1`,
            [name]
        ) ;
        
        if(user.rows.length == 0){
            res.json("User didn't exist");
        }
        res.json(user.rows[0]);
        
    }catch(err){
        console.log(err.message);
    }
})
//create user
app.post("/signup", async(req,res)=>{
    try{
        const { name,email,password,roles} = req.body;

        const hashedPassword = await bcrypt.hash(password,10);
        
        const newUser = await pool.query(
            `insert into project.user (name,email,password,roles) values($1,$2,$3,$4)`,
            [name,email,hashedPassword,roles]
        );
        
        res.status(202).json({message : "User Created Successfully"});
    }catch(err){
        //console.log(err.message);
        res.send(err.message);
    }
})
//login 
app.post('/login', async(req, res) => {
    try{
        const {username, password} = req.body;
        const user = await pool.query(
            `select password,roles from project.user where email = $1`,
            [username]
        );
        console.log(user)
        if(user.rows.length == 0){
            res.status(400).json({message : "Incorrect username"});
            return;
        }

        const isCorrectPassword = await bcrypt.compare(password, user.rows[0].password);

        if(!isCorrectPassword){
            res.status(400).json({message : "Incorrect Password"});
            return;
        }

        const userDetails = { email:username, roles:user.rows[0].roles };
        const accessToken = jwt.sign(userDetails, process.env.ACCESS_TOKEN_SECRET);
        res.status(202).json({message : "User loggedin successfully.", accessToken:accessToken}); 
    }
    catch(err){
        res.json(err.message);
    }
})
function authenticateToken(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null){
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err,userDetails) => {
        if(err){
            return res.sendStatus(403);
        }
        req.user = userDetails;
        next();
    })
}
//delete user
app.delete("/delete-user",authenticateToken, async(req,res)=>{
    try{
        //to-do Authentication
        const user = req.user;
        const { email } = req.body;
        console.log(user.roles);
        if(user.roles != "admin"){
            return res.sendStatus(401);
        }
        const newUser = await pool.query(
            `delete from project.user where email = $1`,
            [email]
        ) ;
        res.status(400).json({message : "User deleted successfully"});
    }catch(err){
        res.status(500).json({message : err.message});
    }
})

// Product API

//create product
app.post('/create-product', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if(user.roles == 'shopper'){
            return res.sendStatus(401);
        }
        const { title,pictureUrl,price } = req.body;

        const newProduct = await pool.query(
            `insert into project.product (status,title,pictureUrl,price,createdBy) values($1,$2,$3,$4,$5)`,
            ["draft",title,pictureUrl,price,user.email]
        );
        
        res.status(201).json({message : "Product Created Successfully"});

    } catch (err) {
        res.status(500).json({message : err.message});
    }
})
// delete product
app.delete('/delete-product/:id',authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if(user.roles != 'admin'){
            return res.sendStatus(401);
        }
        const id = req.params.id;

        const deleteProduct = await pool.query(
            `delete from project.product where id = $1`,[id]
        );

        res.status(202).json({message : "Product deleted Successfully"});

    } catch (err) {
        res.status(500).json({message : err.message});
    }
})
// change product-status
app.patch('/change-product-status/:id', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const updatedStatus = req.body.status;
        if((user.roles != 'admin' && (updatedStatus == 'active' || updatedStatus == 'inactive')) || (user.roles == 'shopper')){
            return res.sendStatus(401);
        }
        const id = req.params.id;

        const updatedProduct = await pool.query(
            `update project.product set status = $1 where id = $2`, [updatedStatus,id]
        );

        res.status(202).json({message : "Product Status updated successfully"});

    } catch (err) {
        res.status(500).json({message : err.message});
    }
})
// updateProduct
app.put('/update-product/:id',authenticateToken, async(req, res) => {
    const user = req.user;
    if(user.roles == 'shopper'){
        return res.status(401).json({message: 'User is unauthorized'});
    }
    let {title,pictureUrl,price} = req.body;
    const id = req.params.id;

    const product = await pool.query(
        `select title,pictureurl,price from project.product where id = $1`,[id]
    );

    if(product.rows.length == 0){
        res.status(500).json({message : 'Product not found'});
    }
   
    if(title == null) 
        title = product.rows[0].title;
    if(pictureUrl == null)
        pictureUrl = product.rows[0].pictureurl;
    if(price == null)
        price = product.rows[0].price;

    const updatedProduct  = await pool.query(
        `update project.product set 
        title = $1,
        pictureurl = $2,
        price = $3 
        where id = $4`,[title,pictureUrl,price,id]
    );

    res.status(202).json({message : "Product updated successfully"});
})

//Order

//Create Order
app.post('/create-order',authenticateToken, async(req,res) => {
    try {
        const user = req.user;
        const orderIds = req.body.orderIds;
        let totalPrice = 0;
        for(orderId of orderIds) {
            const product = await pool.query(
                `select status,price from project.product where id = $1`,
                [orderId]
            ) ;
            
            if(product.rows.length == 0){
                res.status(500).json({ message : 'Product not found' });
            }
            if(product.rows[0].status != 'active'){
                res.status(500).json({ message : 'Product is not active' });
            }
            totalPrice += product.rows[0].price;
        }

        const order = await pool.query(
            `insert into project.order (status,items,totalprice,createdBy) values($1,$2,$3,$4)`,
            ["active",orderIds,totalPrice,user.email]
        )

        res.status(201).json({message : "Order Places Successfully"});
    } catch (err) {
        res.status(500).json({message : err.message});
    }
})
//update order-status
app.patch('/change-order-status/:id', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const updatedStatus = req.body.status;
        if(user.roles != 'admin'){
            return res.sendStatus(401);
        }
        const id = req.params.id;

        const updatedOrder = await pool.query(
            `update project.order set status = $1 where id = $2`, [updatedStatus,id]
        );

        res.status(202).json({message : "Order Status updated successfully"});

    } catch (err) {
        res.status(500).json({message : err.message});
    }
})

//update user
 app.listen(3000, () => {
     console.log("Server is listening on port 3000");
 })