"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const db_1 = require("../db");
const middleware_1 = require("./middleware");
const userRouter = express_1.default.Router();
userRouter.post('/signup', ((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if user already exists
    const email = req.body.email;
    const userExists = yield db_1.userModel.findOne({
        email: email
    });
    if (userExists) {
        return res.status(400).json({
            message: "User already exists"
        });
    }
    try {
        //---------------------Zod Validation-----------------------------
        const validateUser = zod_1.z.object({
            username: zod_1.z.string().min(3).max(20),
            password: zod_1.z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, { message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character", }),
            email: zod_1.z.string().min(5).max(50).email()
        });
        const parsedData = validateUser.safeParse(req.body);
        if (!parsedData.success) {
            return res.status(400).json({
                message: "Invalid user data",
                error: parsedData.error
            });
        }
        //--------------------------------------------------------------
        const email = req.body.email;
        const username = req.body.username;
        const password = req.body.password;
        const hashedPassword = yield bcrypt_1.default.hash(password, 5);
        yield db_1.userModel.create({
            email: email,
            username: username,
            password: hashedPassword
        });
        return res.status(201).json({
            message: "Signup successful"
        });
    }
    catch (err) {
        res.status(500).json({ message: "Internal server error", error: err });
    }
})));
userRouter.post('/signin', ((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = yield db_1.userModel.findOne({
            email: email
        });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        const verifypasword = yield bcrypt_1.default.compare(password, user.password);
        if (verifypasword) {
            // Check if JWT_SECRET is defined in env or not(this is compulsory in ts)
            if (!JWT_SECRET) {
                console.error("JWT_SECRET is not defined in your environment.");
                return res.status(500).json({ message: "Internal server error" });
            }
            const token = jsonwebtoken_1.default.sign({
                userId: user._id.toString(),
            }, JWT_SECRET);
            return res.status(200).json({
                message: "Signin successful",
                token: token
            });
        }
        else {
            return res.status(401).json({
                message: "Invalid password"
            });
        }
    }
    catch (err) {
        res.status(500).json({ message: "Internal server error", error: err });
    }
})));
userRouter.post('/contents', middleware_1.authMiddleware, ((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const link = req.body.link;
        const title = req.body.title;
        const type = req.body.type;
        yield db_1.contentModel.create({
            link: link,
            title: title,
            type: type,
            tags: [],
            userId: req.body.userId,
        });
        return res.status(201).json({
            message: "Content added successfully"
        });
    }
    catch (err) {
        res.status(500).json({ message: "Internal server error", error: err });
    }
})));
userRouter.get('/contents', middleware_1.authMiddleware, ((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const contents = yield db_1.contentModel.find({
            userId: userId
        }).populate('userId', 'username'); //since reference to User model
        return res.status(200).json({
            contents: contents
        });
    }
    catch (err) {
        res.status(500).json({ message: "Internal server error", error: err });
    }
})));
userRouter.delete('/contents', middleware_1.authMiddleware, ((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contentId = req.body.contentId;
        const userId = req.userId;
        const content = yield db_1.contentModel.deleteMany({
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
    }
    catch (err) {
        res.status(500).json({ message: "Internal server error", error: err });
    }
})));
exports.default = userRouter;
