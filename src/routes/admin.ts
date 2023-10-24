import {Router} from "express"
import {db, storage} from "../utils/database"
import {auth} from "../middlewares/auth";
import {adminAuth} from "../middlewares/isAdmin";
import dotenv from 'dotenv'
import {doc, getDoc, updateDoc} from "firebase/firestore";
import {ref, listAll, getMetadata} from "firebase/storage";


dotenv.config()

const app = Router();


app.get("/filesbyuser", auth, adminAuth, async (req: any, res) => {
    try {
        console.log(req.body)
        if (!req.body.userID)
            throw new Error("No user selected")
        const listRef = ref(storage, `${req.body.userID}/`);

        // const docRef: any = doc(db, 'utilisateurs', req.auth.userId);
        // const user: any = (await getDoc(docRef)).data()

        const file = await listAll(listRef)

        res.json(await Promise.all(file.items.map(async x =>  {
            const metaData = await getMetadata(x)
            return {
                name: x.name,
                size: metaData.size,
                type: metaData.contentType,
                created: metaData.timeCreated,
            }
        })));
    } catch (e: any) {
        res.status(500).json({error: e.message})
    }
})


export default app;
