import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import dotenv from 'dotenv'

dotenv.config()

const firebaseConfig = {
    apiKey: "AIzaSyDY7DrllD5-dQWY0D4c3uv98Uy_nMM2s4s",
    authDomain: "honee-4a5ba.firebaseapp.com",
    projectId: "honee-4a5ba",
    storageBucket: "honee-4a5ba.appspot.com",
    messagingSenderId: "560452465644",
    appId: "1:560452465644:web:68f779e30cfd86d27706c9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);


// export default {
//     db: getFirestore(app),
//     storage: getStorage(app),
// };