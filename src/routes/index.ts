import { Router } from "express";
import AuthRoutes from "./auth";
import FileRoutes from "./files";
import PaymentRoutes from "./payment";
import AdminRoutes from "./admin"

const app = Router();

app.use("/auth", AuthRoutes);
app.use("/file", FileRoutes);
app.use("/admin", AdminRoutes);
app.use("/payment", PaymentRoutes);

export default app;