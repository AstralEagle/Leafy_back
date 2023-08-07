import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.DATABASE_URL,
    authDomain: "leafy-4f506.firebaseapp.com",
    databaseURL: "https://leafy-4f506-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "leafy-4f506",
    storageBucket: "leafy-4f506.appspot.com",
    messagingSenderId: "99751034639",
    appId: "1:99751034639:web:d4d715f8d79380c3ca087a",
    measurementId: "G-EERTEV8HEW"
};

const app = initializeApp(firebaseConfig);
const analytics = getFirestore(app);


export default analytics;