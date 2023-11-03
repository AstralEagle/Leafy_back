/** source/server.ts */
import http from 'http';
import express, {Express} from 'express';
import Routes from './routes'
import sgMail from "@sendgrid/mail";
import dotenv from 'dotenv'

dotenv.config()

sgMail.setApiKey(process.env.KEY_EMAIL as string)

//Initialisation de la base de donné

const router: Express = express();

router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST INFO');
    next();
});

router.use(Routes);

router.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    });
});

/** Server */
const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 3001;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));