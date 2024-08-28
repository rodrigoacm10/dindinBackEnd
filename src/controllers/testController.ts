// require("dotenv").config({ path: '../.env' });
// const PostUser = require("../Model/PostUser");
// const bcrypt = require("bcryptjs");
// const JWT = require("jsonwebtoken");
import { Request, Response } from "express";

export const logar = (req: Request, res: Response) => {
  console.log(req.body);
  res.status(300).send({ mesage: "Acessou" });
};

// exports.logar = (req, res) => {
//     const { email, password } = JSON.parse(req.body.body);

//     // First, search the User by email to validate username
//     PostUser.find({ email }, (err, result) => {
//         if (err) {
//             res.status(400).json({
//                 message: "Cannot search User. " + err
//             });
//         }
//         else {
//             // No emails found, means invalid email
//             if (result.length === 0) {
//                 res.status(400).json({
//                     message: "Email does not exist!"
//                 });
//             }
//             else {
//                 // Email is found, compare passwords
//                 bcrypt.compare(password, result[0].password, (err, decoded) => {
//                     if (err) {
//                         res.status(400).json({
//                             message: "Cannot compare passwords. " + err
//                         });
//                     }
//                     else if (decoded) {

//                         // Sign a JWT token and pass the email as the payload, valid for one hour only
//                         let token = JWT.sign({ email: result[0].email }, process.env.TOKEN_SECRET, { expiresIn: 60 * 60 });

//                         // Pass token to User
//                         res.status(200).json({
//                             token
//                         });
//                     }
//                     else {
//                         res.status(401).json({
//                             message: "Passwords do not match"
//                         });
//                     }
//                 });
//             }
//         }
//     });
// }
