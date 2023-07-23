import express from "express";
import {createUser,getUsersById,getUsers,login} from './database.js';

const app = express();

app.use(express.json())

app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).send("Something broke");
})
app.listen(8080,()=>{
    console.log("Server runing on port 8080");
});

app.get('/',async (req,res)=>{
    const [user] = await createUser({email:"saikat.mohanty@lipl.in",name:"Saikat Mohanty",username:"saikatmohanty",password:"1234"})
    console.log(user);
    return res.send(user)
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
        const data = {
            "id":user.id,
            "name":user.name,
            "email":user.email,
            "username":user.username
        }
        res.status(200).send({"msg":"Logged in successfully","data":data,"status":200});
    }
    res.status(404).send({"msg":"Invalid username or password","data":{},"status":404});
})