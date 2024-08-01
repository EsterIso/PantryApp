// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDV7dKgLDtSbIXgkhbpCxVfmEbUl33wkXs",
  authDomain: "inventory-management-app-8d36a.firebaseapp.com",
  projectId: "inventory-management-app-8d36a",
  storageBucket: "inventory-management-app-8d36a.appspot.com",
  messagingSenderId: "423989949141",
  appId: "1:423989949141:web:b0a66cd9b03b969ea4a85c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };