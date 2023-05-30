import {Router} from "express"

const app = Router( );

app.use("/login", (req, res) => {
    res.status(200).send("Login")
})

export default app;
