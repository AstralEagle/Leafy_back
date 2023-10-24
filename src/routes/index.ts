import {Router} from "express"
import AuthRoutes from "./auth"
import FileRoutes from "./files"
import AdminRoutes from "./admin"
import BodyParse from "body-parser";

const app = Router();

app.use("/auth", AuthRoutes);
app.use("/file", FileRoutes);
app.use("/admin", AdminRoutes);

/*
app.post('/webhook', BodyParse.raw({type: 'application/json'}), (request, response) => {
    const event = request.body;

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent was successful!');
            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;
            console.log('PaymentMethod was attached to a Customer!');
            break;
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.json({received: true});
});
*/

export default app;