import {Router} from "express"
import {collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db }  from "../utils/database"
import * as bcrypt from 'bcrypt';
import jwt, {Secret} from 'jsonwebtoken';
import { auth } from "../middlewares/auth";
import dotenv from "dotenv";
import { sendMail } from "./mail";

dotenv.config();

interface UserInterface {
  isAdmin: boolean;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  dateCreated: any;
}

const secretKey = process.env.KEY_TOKEN;
const app = Router();

const login = async (email: string, password: string) => {
  const usersCollection = collection(db, "utilisateurs");
  const user: any = (await getDocs(usersCollection)).docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .find((x: any) => x.email === email);
  if (!user) {
    throw new Error("User not found!");
  }
  const isValid = bcrypt.compareSync(password, user.password);
  if (!isValid) {
    throw new Error("Password wrong");
  }

  const userToken = jwt.sign(
    {
      user: {
        id: user.id,
        lastName: user.lastName,
        firstName: user.firstName,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      options: {
        expiresIn: "2h",
      },
    },
    secretKey as Secret
  );

  return userToken;
};

app.get("/users", auth, async (req: any, res) => {
  try {
    const usersCollection = collection(db, "utilisateurs");
    const users = (await getDocs(usersCollection)).docs;
    res.status(200).json(users);
  } catch (e) {
    console.error(e);
    res.status(500);
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userToken = await login(email, password);
    res.status(200).json({ userToken });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
app.post("/signup", async (req, res) => {
  try {
    const {
      password,
      email,
      firstName,
      lastName,
      zip,
      city,
      country,
      address,
    } = req.body;

    const hash = bcrypt.hashSync(password, 10);

    const usersCollection = collection(db, "utilisateurs");
    const user = await addDoc(usersCollection, {
      dataCreated: serverTimestamp(),
      isAdmin: false,
      email,
      firstName,
      lastName,
      password: hash,
      storage: 0,
      files: [],
      address: {
        zip,
        city,
        country,
        address,
      },
    });

    const invoicesCollection = collection(db, "invoices");
    await addDoc(invoicesCollection, {
      date: serverTimestamp(),
      TVA: 20, // %
      taxes: (19.1 * 20) / 100 + 0.9, // €
      quantity: 20, // GO
      stripe: 0.9, // € taxes
      amount: 15.28, // HT €
      totalAmount: 15.28 + 0.9 + (19.1 * 20) / 100, // € TTC
      userId: user.id,
      address: {
        zip,
        city,
        country,
        address,
      },
    });

    // await sendMail({ email, firstName, lastName, isNewUser: true });

    const userToken = await login(email, password);
    res.status(201).send({ userToken });
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
});
app.delete("/", auth, async (req: any, res) => {
  try {
    const userDoc = doc(db, "utilisateurs", req.auth.userId);
    const user: any = (await getDoc(userDoc)).data();
    const data: any = {
      to: user.email,
      from: "leafy.ipssi@gmail.com",
      subject: "Suppression du compte leafy",
      text: `${user.firstName} ${user.lastName}, votre compte a été supprimé !`,
      html: `<div><h1>Oh non</h1><p>${user.firstName} ${user.lastName}, nous sommes tristes que vous décidiez de quitter l'aventure Leafy aussi tôt. Nous espérons que vous reviendrez vite!</p></div>`,
    };
    // envoyer un email a l'admin
    await deleteDoc(userDoc);
    res.status(200).send("Success removed");
  } catch (e) {
    console.error(e);
    res.status(500);
  }
});
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
