import {Router} from "express"
import {ref, getDownloadURL, uploadBytes} from "firebase/storage";
import {db, storage} from "../utils/database"
import {auth} from "../middlewares/auth";
import multer from "multer";
import dotenv from 'dotenv'
import {doc, getDoc, updateDoc} from "firebase/firestore";
import * as bcrypt from "bcrypt";

dotenv.config()

const app = Router();

const upload = multer({storage: multer.memoryStorage()});

app.get("/", auth, async (req: any, res) => {
    try {
        const docRef: any = doc(db, 'utilisateurs', req.auth.userId);
        const user: any = (await getDoc(docRef)).data()

        res.json(user.files)
    } catch (e: any) {
        console.error(e)
        res.status(500).json({error: e.message})
    }
})
app.post("/", auth, upload.single("filename"), async (req: any, res) => {
    try {
        console.log(req.file)
        if (!req.file) {
            throw new Error("No File")
        }
        const dateTime = giveCurrentDateTime();

        const fileName = dateTime + ":/" + req.file.originalname

        const storageRef = ref(storage, `files/${fileName}`);

        // Create file metadata including the content type
        const metadata = {
            contentType: req.file.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytes(storageRef, req.file.buffer);
        //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

        // Grab the public url
        if (!snapshot)
            throw new Error("No snap")
        const downloadURL = await getDownloadURL(snapshot.ref);
        // const downloadURL = await snapshot.ref.getDownloadURL();

        const docRef: any = doc(db, 'utilisateurs', req.auth.userId);
        const user: any = (await getDoc(docRef)).data()
        const dataEdited: any = {
            files: [
                ...user.files,
                {
                    url: downloadURL,
                    date: dateTime,
                    size: req.file.size
                }]
        }
        await updateDoc(docRef, dataEdited);

        return res.send({
            message: 'file uploaded to firebase storage',
            name: req.file.originalname,
            type: req.file.mimetype,
            downloadURL: downloadURL
        })
    } catch (e: any) {
        console.error(e)
        res.status(500).json({error: e.message})
    }
});


const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}


export default app;
