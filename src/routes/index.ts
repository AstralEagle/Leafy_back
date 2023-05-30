import {Router} from "express"
import AuthRoutes from "./auth"

const app = Router();

app.use("/auth", AuthRoutes);

export default app;