import dotenv from 'dotenv';
import mysql from 'mysql2';
import crypto from 'crypto';

dotenv.config();

const pool = mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSOWRD,
    database:process.env.DB_DATABASE
}).promise();

const salt = '028239e1efe1811b052fece5ec13671e';

function createPass(pass)
{
    const hash = crypto.pbkdf2Sync(pass,salt,1000,64,`sha512`).toString('hex');
    return hash;
}

function comparePass(pass,hashPass)
{
    const hash = crypto.pbkdf2Sync(pass,salt,1000,64,`sha512`).toString('hex');
    return hash == hashPass;
}
export async function getUsers() {
    const [rows] = await pool.query(`Select * from users`);
    return rows;
}

export async function getUsersById(id){
    const [rows] = await pool.query(`
        Select * from users
        where id = ?
    `,[id]);
    return rows;
}

export async function createUser(users)
{
    var pass = createPass('1234');
    if(users.length > 0)
    {
        const [rows] = await pool.query(`
            INSERT into users (name,email,username,password) values (?,?,?,?)
        `,[users.name,users.email,users.username,pass]);
        const userdata = await getUsersById(rows.insertId);
        return userdata;
    }else{
        return false;
    }
}

export async function login(userlogin){
    const [user] = await pool.query(`
        SELECT * FROM users WHERE email=?
    `,[userlogin.email]);
    if(user[0])
    {
        if(comparePass(userlogin.password,user[0].password))
        {
            return user[0];
        }else{
            return false;
        }
    }else{
        return false;
    }
}