import {Router} from "express"
import {collection, doc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import db from "../utils/database"
import * as bcrypt from 'bcrypt';
import jwt, {Secret} from 'jsonwebtoken';
import {auth} from "../middlewares/auth";

import dotenv from 'dotenv'

dotenv.config()

const secretKey = process.env.KEY_TOKEN;


const app = Router();

app.get("/users", auth, async (req: any, res) => {
    console.log(req.auth)
    try {
        const usersCollection = collection(db, 'utilisateurs');
        const users = (await getDocs(usersCollection)).docs;
        res.status(200).json(users)
    } catch (e) {
        console.error(e)
        res.status(500)
    }
})
app.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body;
        const usersCollection = collection(db, 'utilisateurs');
        const user: any = (await getDocs(usersCollection)).docs.map(doc =>
            ({
                id: doc.id,
                ...doc.data()
            }
        )).find((x: any) => x.email === email);
        if (!user) {
            throw new Error("User not found!")
        }
        const isValid = bcrypt.compareSync(password, user.password);
        if(!isValid){
            throw new Error("Password wrong")
        }

        const userToken = jwt.sign({
            user: {
                id: user.id,
                lastName: user.lastName,
                firstName: user.lastName,
                email: user.email,
                isAdmin: user.isAdmin
            }
        }, secretKey as Secret)

        res.status(200).json({userToken})
    }
    catch(e: any){
        console.error(e)
        res.status(500).json({error: e.message })
    }
})
app.post("/signup", async (req, res) => {
    try{
        const {password, email, firstName, lastName} = req.body

        const hash = bcrypt.hashSync(password, 10);

        const usersCollection = collection(db, 'utilisateurs');
        await addDoc(usersCollection, {
            dateCreated: serverTimestamp(),
            isAdmin: false,
            email,
            firstName,
            lastName,
            password: hash
        });
        res.status(201).send("Create account is successful")
    } catch (e) {
        console.error(e)
        res.status(500).send(e)
    }
})
app.delete("/", auth, async (req: any, res) => {
    try{
        console.log(req.auth)
        const docRef = doc(db, 'utilisateurs', req.auth.userId);
        await deleteDoc(docRef);
        res.status(200).send("Success removed")
    }catch (e) {
        console.error(e)
        res.status(500)
    }

})
app.put("/newAdmin", auth, async (req: any, res) => {
    if(!req.auth.isAdmin){
        return res.status(500).send("Your are not admin")
    }
    try{
        if(!req.body.userId){
            throw new Error("Missing user")
        }
        const docRef: any = doc(db, 'utilisateurs', req.body.userId);
        const dataEdited: any = {
            isAdmin: true
        }
        await updateDoc(docRef, dataEdited );
        res.status(200).send("Edit admin is succesful")
    }catch (e) {
        console.error(e)
        res.status(500)
    }
})
app.put("/profile", auth, async(req: any, res) => {
    const {firstName, lastName, email, password} = req.body
    try{
        const docRef: any = doc(db, 'utilisateurs', req.auth.userId);
        const hash = bcrypt.hashSync(password, 10);
        const dataEdited: any = {firstName, lastName, email, password: hash}
        await updateDoc(docRef, dataEdited);
        res.status(200).send("Edit profil success")
    }catch(e){
        console.error(e)
        res.status(500)
    }
})


export default app;
