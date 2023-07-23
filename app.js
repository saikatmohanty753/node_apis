import express from "express";
import {createUser,getUsersById,getUsers,login} from './database.js';
import { generateToken } from "./generateToken.js";
import jwt from 'jsonwebtoken';

const app = express();

app.use(express.json())

app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).send("Something broke");
})
app.listen(8080,()=>{
    console.log("Server runing on port 8080");
});

app.post('/create',async (req,res)=>{
    const [user] = await createUser(req.body);
    if(user)
    {
        res.status(200).send({"msg":"User added successfully","status":"200","data":user});
    }
    res.status(404).send({"msg":"Failed to add users","status":"404","data":{}})
});

app.get('/list',async (req,res)=>{
    const [userlist] = await getUsers();
    res.send(userlist);
});

app.get('/userdata/:id',async (req,res)=>{
    const id = req.params.id;
    const user = await getUsersById(id)
    res.send(user);
});

app.post('/login', async (req,res)=>{
    const user = await login(req.body);
    if(user)
    {
        const token = generateToken({user:user})
        console.log(jwt.decode(token,process.env.ACCESS_TOKEN));
        const data = {
            "id":user.id,
            "name":user.name,
            "email":user.email,
            "username":user.username,
            "access_token":token
        }
        res.status(200).json({"msg":"Logged in successfully","data":data,"status":200});
    }
    res.status(404).json({"msg":"Invalid username or password","data":{},"status":404});
})