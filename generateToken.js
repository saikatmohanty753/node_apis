import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export function generateToken(user)
{
    return jwt.sign(user,process.env.ACCESS_TOKEN,{expiresIn:"15m"});
}
