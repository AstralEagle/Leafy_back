import {Router} from "express"
import {collection, getDocs} from "firebase/firestore";
import db from "../utils/database"

const app = Router();

app.get("/login", (req, res) => {
    res.status(200).send("Login")
})
app.get("/users", async (req, res) => {
    try {
        const citiesCol = collection(db, 'utilisateurs');
        const citySnapshot = await getDocs(citiesCol);
        const cityList = citySnapshot.docs.map(doc => doc.data());
        res.status(200).json(cityList)
    } catch (e) {
        console.error(e)
        res.status(500)
    }
})


export default app;
