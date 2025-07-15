import dotenv from "dotenv";
dotenv.config()
import express, { Request, Response, NextFunction,RequestHandler } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import JWT from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;

import { userModel, tagsModel, contentModel, linksModel } from '../db';

import { authMiddleware } from './middleware';
const userRouter = express.Router();





userRouter.post('/signup', (async(req:Request,res:Response , next:NextFunction)=> {

    // Check if user already exists
    const email = req.body.email;
    const userExists = await userModel.findOne({
        email:email 
    })
    if(userExists){
        return res.status(400).json({
            message:"User already exists"
        })
    }


try{
    

//---------------------Zod Validation-----------------------------
    const validateUser = z.object({
        username:z.string().min(3).max(20),
        password:z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,{message:
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",}),
        email:z.string().min(5).max(50).email()
    })
    const parsedData = validateUser.safeParse(req.body);
    if(!parsedData.success){
        return res.status(400).json({
            message:"Invalid user data",
            error:parsedData.error
        });
    }
//--------------------------------------------------------------
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password,5);

    await userModel.create({
        email:email,
        username:username,
        password:hashedPassword
    })



    return res.status(201).json({
        message:"Signup successful"
    });

}catch(err){
        res.status(500).json({ message: "Internal server error", error: err });
    }   


})as RequestHandler);


userRouter.post('/signin', (async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;

        const user = await userModel.findOne({
            email:email
        })
        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        }

        const verifypasword  = await bcrypt.compare(password,user.password);

        if(verifypasword){
            // Check if JWT_SECRET is defined in env or not(this is compulsory in ts)
            if (!JWT_SECRET) {
                console.error("JWT_SECRET is not defined in your environment.");
                return res.status(500).json({ message: "Internal server error" });
            }

            const token = JWT.sign({
                userId:user._id.toString(),
                },JWT_SECRET);

            return res.status(200).json({
                message:"Signin successful",
                token:token
            })

        }else{
            return res.status(401).json({
                message:"Invalid password"
            })
        }

    }catch(err){
        res.status(500).json({ message: "Internal server error", error: err });
    }

})as RequestHandler);


userRouter.post('/contents', authMiddleware, (async (req: Request, res: Response , next:NextFunction) => {

    try{
        const link = req.body.link;
        const title = req.body.title;
        const type = req.body.type;

        await contentModel.create({
            link:link,
            title:title,
            type:type,
            tags: [],
            userId:req.body.userId,
        })

        return res.status(201).json({
            message: "Content added successfully"
        });

    }
    catch(err){
        res.status(500).json({ message: "Internal server error", error: err });
    }

})as RequestHandler);


userRouter.get('/contents', authMiddleware, (async (req: Request, res: Response , next:NextFunction) => {
    
    try{
        const userId = req.userId;
        const contents = await contentModel.find({
            userId: userId
        }).populate('userId', 'username') //since reference to User model

        return res.status(200).json({
            contents: contents
        });
    }catch(err){
        res.status(500).json({ message: "Internal server error", error: err }); 
    }
})as RequestHandler);


userRouter.delete('/contents', authMiddleware,(async (req: Request, res: Response , next:NextFunction) => {
    try{
        const contentId = req.body.contentId;
        
        const userId = req.userId;

        const content = await contentModel.deleteMany({
            _id: contentId,
            userId: userId
        });

        if (!content) {
            return res.status(404).json({
                message: "Content not found or unauthorized"
            });
        }

        return res.status(200).json({
            message: "Content deleted successfully"
        });

    }catch(err){
        res.status(500).json({ message: "Internal server error", error: err });
    }
})as RequestHandler);



export default userRouter;



