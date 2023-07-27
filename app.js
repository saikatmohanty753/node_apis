import express from "express";
import {createUser,getUsersById,getUsers,login,deleteUser} from './database.js';
import { generateToken } from "./generateToken.js";
import { body, validationResult } from "express-validator";
import cors from 'cors';

const app = express();

app.use(cors({origin:"http://localhost:3000"}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).send("Something broke");
})
app.listen(8080,()=>{
    console.log("Server runing on port 8080");
});

app.post('/create',[
    body('name').notEmpty().withMessage('Please enter your name'),
    body('email').notEmpty().withMessage('Please enter your valid email'),
    body('username').notEmpty().withMessage('Please enter your username')
],async (req,res)=>{
    
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        const errorResponse = {};
        let i =0;
        errors.array().forEach(error => {
            errorResponse[i] = error.msg;
            i++;
        });
        return res.status(400).json({ data: errorResponse,status:400,msg:"error" });
    }
    const user = await createUser(req.body);
    if(user)
    {
        return res.status(200).json({"msg":"User added successfully","status":"200","data":user});
    }
    return res.status(404).json({"msg":"Failed to add users","status":"404","data":{}})
});

app.get('/list',async (req,res)=>{
    const [userlist] = await getUsers();
    return res.status(200).json(userlist);
});

app.get('/userdata/:id',async (req,res)=>{
    const id = req.params.id;
    const user = await getUsersById(id)
    return res.status(200).json(user);
});

app.post('/login', async (req,res)=>{
    const {email,password} = req.body;
    console.log(req.body);
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await login({email:email,password:password});
    if(user)
    {
        const token = generateToken({user:user})
        /* console.log(jwt.decode(token,process.env.ACCESS_TOKEN)); */
        const data = {
            "id":user.id,
            "name":user.name,
            "email":user.email,
            "username":user.username,
            "access_token":token
        }
        return res.status(200).json({"msg":"Logged in successfully","data":data,"status":200});
    }
    return res.status(404).json({"msg":"Invalid username or password","data":{},"status":404});
});

app.get('/delete-user/:id',async (req,res)=>{
    const id = req.params.id;
    if(!id)
    {
        return res.status(401).json({status:401,data:"error",msg:"error"});
    }
    const isDelete = await deleteUser(id);
    if(isDelete)
    {
        return res.status(200).json({status:200,data:"",msg:"success"});
    }
    return res.status(404).json({status:404,msg:"error",data:""});
})