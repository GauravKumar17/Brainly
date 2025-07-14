"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMidleware = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const authMidleware = (req, res, next) => {
    const token = req.headers.authorization;
    const verifyToken = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    if (verifyToken) {
        //@ts-ignore
        req.userId = verifyToken.userId;
        next();
    }
    else {
        return res.status(401).json({
            message: "Unauthorized access"
        });
    }
};
exports.authMidleware = authMidleware;
