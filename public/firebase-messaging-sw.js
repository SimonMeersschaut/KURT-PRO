importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB75Wjo0R-BV4KCPXM583sM_WYz5kxAeVI",
  authDomain: "kurt-pro.firebaseapp.com",
  projectId: "kurt-pro",
  storageBucket: "kurt-pro.firebasestorage.app",
  messagingSenderId: "267865734599",
  appId: "1:267865734599:web:ef9704e9e8b87cf1162de2",
  measurementId: "G-61XFNR6X5K"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png", // Change to your app icon
  });
});