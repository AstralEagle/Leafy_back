import {Router} from "express"
import AuthRoutes from "./auth"
import FileRoutes from "./files"
import AdminRoutes from "./admin"

const app = Router();

app.use("/auth", AuthRoutes);
app.use("/file", FileRoutes);
app.use("/admin", AdminRoutes);

export default app;