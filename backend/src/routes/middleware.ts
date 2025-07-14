import dotenv from "dotenv";
dotenv.config()
import {Request,Response,NextFunction} from 'express';
import JWT from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;


export const authMidleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    const verifyToken = JWT.verify(token as string, JWT_SECRET as string);

    if(verifyToken){
        //@ts-ignore
        req.userId = verifyToken.userId;
        next();
    }else{
        return res.status(401).json({
            message: "Unauthorized access"
        });
    }
}



