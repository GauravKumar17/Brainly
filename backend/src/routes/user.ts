const dotEnv = require("dotenv").config();
const {Router} = require("express");
const{z} = require("zod");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_ECRET;

const{userModel, tagsModel, contentModel, linksModel} = require("../db");
const userRouterNew = Router();

