import {Router} from "express"

const app = Router( );

app.get("/login", (req, res) => {
    res.status(200).send("Login")
})
app.get("/users", async (req, res) => {

})


export default app;
