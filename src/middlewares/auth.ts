import jwt, {Secret} from 'jsonwebtoken';
import dotenv from 'dotenv'

dotenv.config()

export const auth = (req: any, res: any, next: any) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken: any = jwt.verify(token, process.env.KEY_TOKEN as Secret);
        const userId = decodedToken.user.id;
        req.auth = {
            userId: decodedToken.user.id,
            idAdmin: decodedToken.user.isAdmin
        };
        next();
    } catch(error) {
        res.status(401).json({ error });
    }
}


