// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB_SSBCGB_0opdwubYYUPjJUkzmbaN3ROo",
    authDomain: "leafy-4f506.firebaseapp.com",
    databaseURL: "https://leafy-4f506-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "leafy-4f506",
    storageBucket: "leafy-4f506.appspot.com",
    messagingSenderId: "99751034639",
    appId: "1:99751034639:web:d4d715f8d79380c3ca087a",
    measurementId: "G-EERTEV8HEW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getFirestore(app);


export default analytics;