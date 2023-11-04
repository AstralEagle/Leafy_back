import {Router} from "express"
import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, updateDoc} from "firebase/firestore";
import {db, storage} from "../utils/database"
import * as bcrypt from 'bcrypt';
import jwt, {Secret} from 'jsonwebtoken';
import {auth} from "../middlewares/auth";
import dotenv from 'dotenv'
import {deleteObject, ref} from "firebase/storage";
import {mailSender} from "../utils/email";

dotenv.config()

interface UserInterface {
    isAdmin: boolean;
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    dateCreated: any;
    files: string[];
    storage: {max: number, used: number}
}



const secretKey = process.env.KEY_TOKEN;
const app = Router();

app.get("/users", auth, async (req: any, res) => {
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
        const {password, email, firstName, lastName, address} = req.body
        if(!password || !email || !firstName || !lastName || !address.address || !address.city || !address.country || !address.zip )
            throw new Error("Missing value")

        const hash = bcrypt.hashSync(password, 10);

        const usersCollection = collection(db, 'utilisateurs');
        await addDoc(usersCollection, {
            dateCreated: serverTimestamp(),
            isAdmin: false,
            email,
            firstName,
            lastName,
            address,
            password: hash,
            storage: {used: 0, max: 21474836480	},
            files: []
        });
        const data: any = {
            to: email,
            subject: 'Honee vous souhaite le bienvenue',
            text: `${firstName} ${lastName}, l'équipe de Honee vous souhaite le bienvenue!`,
            html: `<div><h1>Bienvenue</h1><p>${firstName} ${lastName}, toute l'équipe de Honee vous souhaite le bienvenue!</p></div>`,
        }
        await mailSender.sendMail(data)
        res.status(201).send("Create account is successful")
    } catch (e: any) {
        console.error(e)
        res.status(500).json({error: e.message})
    }
})
app.delete("/", auth, async (req: any, res) => {
    try {
        const userDoc = doc(db, 'utilisateurs', req.auth.userId);
        const user: any = (await getDoc(userDoc)).data()
        const data: any = {
            to: user.email,
            subject: 'Supression du compte Honee',
            text: `${user.firstName} ${user.lastName}, votre compte a été supprimer!`,
            html: `<div><h1>Ho non</h1><p>${user.firstName} ${user.lastName}, nous sommes triste que vous decidier de quittez l'aventure Honee aussi tôt. Nous espérons que vous reviendrez vite!</p></div>`,
        }
        await mailSender.sendMail(data)


        const emailToAdmin: any = {
            to: "leafy.ipssi@gmail.com",
            subject: 'Un utilisateur a supprimé son compte',
            text: `${user.firstName} ${user.lastName}, votre compte a été supprimer!`,
            html: `<div><h1>Un compte a été supprimer</h1><p>${user.firstName} ${user.lastName} a suprimé son compte.</br> Cela a entrainé la suppresion de ${user.files.length} fichier(s)</p></div>`,
        }
        await mailSender.sendMail(emailToAdmin)


        await Promise.all(user.files.map(async (x: string) => {
            const fileRef = doc(db, "files", x);
            const storageRef = ref(storage, `${req.auth.userId}/${x}`);

            await deleteObject(storageRef);
            await deleteDoc(fileRef);
        }));
        await deleteDoc(userDoc);
        res.status(200).send("Success removed")
    } catch (e) {
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
