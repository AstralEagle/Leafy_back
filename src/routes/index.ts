import {Router} from "express"
import AuthRoutes from "./auth"
import PaymentRoutes from "./payment"

const app = Router();

app.use("/auth", AuthRoutes);
app.use("/payment", PaymentRoutes);

export default app;