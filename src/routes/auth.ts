import {Router} from "express"
import {collection, getDocs, addDoc } from "firebase/firestore";
import db from "../utils/database"
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const secretKey = 'Ui3jlfvYQ9Cp4Gzmy6268f8EANgxirdeMIlQdT3sSDOfHI52wIlqxg4aeR8tKT3';

const app = Router();

app.get("/users", async (req, res) => {
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
    try{
        const {email, password} = req.body;
        const usersCollection = collection(db, 'utilisateurs');
        const user = (await getDocs(usersCollection)).docs.map(doc => doc.data()).find((x) => x.email === email);
        if(!user){
            throw new Error("User not found!")
        }
        bcrypt.compareSync(password, user.password);

        const userToken = jwt.sign({user}, secretKey)

        res.status(200).json(user)
    }
    catch(e){
        console.error(e)
        res.status(500).send(e)
    }
})
app.post("/signup", async (req, res) => {
    try{
        const {password, email, firstName, lastName} = req.body

        const hash = bcrypt.hashSync(password, 10);

        const usersCollection = collection(db, 'utilisateurs');
        await addDoc(usersCollection, {
            dataCreated: new Date(),
            isAdmin: false,
            email,
            firstName,
            lastName,
            password: hash
        });
        res.status(201).send("Create account is successful")
    }catch(e){
        console.error(e)
        res.status(500).send(e)
    }
})


export default app;
