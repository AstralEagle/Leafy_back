import {Router} from "express"
import {ref, getDownloadURL, uploadBytes} from "firebase/storage";
import {db, storage} from "../utils/database"
import {auth} from "../middlewares/auth";
import multer from "multer";
import dotenv from 'dotenv'
import {addDoc, collection, doc, getDoc, serverTimestamp, updateDoc} from "firebase/firestore";
import * as bcrypt from "bcrypt";
import {throws} from "assert";

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
        if (!req.file)
            throw new Error("No File")
        // Verif size
        const docRef: any = doc(db, 'utilisateurs', req.auth.userId);
        const user: any = (await getDoc(docRef)).data()
        const afterSize = parseInt(user.storage) - req.file.size
        if (afterSize < 0) {
            throw new Error("No storage")
        }

        const filesCollection = collection(db, 'files');
        const fileData = await addDoc(filesCollection, {
            date: serverTimestamp(),
            size: req.file.size,
            name: req.file.originalname,
            type: req.file.mimetype,
        })
        const metadata = {
            contentType: req.file.mimetype,
        };
        const storageRef = ref(storage, `${req.auth.userId}/${fileData.id}`);

        const snapshot = await uploadBytes(storageRef, req.file.buffer, metadata);

        const downloadURL = await getDownloadURL(snapshot.ref);

        const dataEdited: any = {
            storage: afterSize,
            files: [
                ...user.files,
                fileData.id
                ]
        }
        await updateDoc(docRef, dataEdited);

        return res.json({
            name: req.file.originalname,
            type: req.file.mimetype,
            downloadURL: downloadURL
        })


    } catch (e: any) {
        console.error(e)
        res.status(500).json({error: e.message})
    }
    // try {
    //     if (!req.file) {
    //         throw new Error("No File")
    //     }
    //     const storageRef = ref(storage, `${req.auth.userId}/${req.file.originalname}`);
    //     await getDownloadURL(storageRef).then(() => {
    //             throw new Error("File exist")
    //         }, () => {
    //             return
    //         });
    //
    //     const docRef: any = doc(db, 'utilisateurs', req.auth.userId);
    //     const user: any = (await getDoc(docRef)).data()
    //
    //     const afterSize = parseInt(user.storage) - req.file.size
    //
    //     if (afterSize < 0) {
    //         throw new Error("No storage")
    //     }
    //
    //     const metadata = {
    //         contentType: req.file.mimetype,
    //     };
    //
    //     const snapshot = await uploadBytes(storageRef, req.file.buffer, metadata);
    //
    //     const downloadURL = await getDownloadURL(snapshot.ref);
    //
    //     const dataEdited: any = {
    //         storage: afterSize,
    //         files: [
    //             ...user.files,
    //             {
    //                 url: downloadURL,
    //                 size: req.file.size
    //             }]
    //     }
    //     await updateDoc(docRef, dataEdited);
    //
    //     return res.json({
    //         message: 'file uploaded to firebase storage',
    //         name: req.file.originalname,
    //         type: req.file.mimetype,
    //         downloadURL: downloadURL
    //     })
    // } catch (e: any) {
    //     console.error(e)
    //     res.status(500).json({error: e.message})
    // }
});




export default app;
