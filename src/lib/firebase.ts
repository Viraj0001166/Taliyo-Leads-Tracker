// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "leadtrack-pulse",
  "appId": "1:972472117593:web:d3aca4dfbc51f8116f0448",
  "storageBucket": "leadtrack-pulse.firebasestorage.app",
  "apiKey": "AIzaSyD96cJIAe4rtL6b5pxU35kSzKL7Lkl-Q0w",
  "authDomain": "leadtrack-pulse.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "972472117593"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
