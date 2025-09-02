import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB75Wjo0R-BV4KCPXM583sM_WYz5kxAeVI",
  authDomain: "kurt-pro.firebaseapp.com",
  projectId: "kurt-pro",
  storageBucket: "kurt-pro.firebasestorage.app",
  messagingSenderId: "267865734599",
  appId: "1:267865734599:web:ef9704e9e8b87cf1162de2",
  measurementId: "G-61XFNR6X5K"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };

