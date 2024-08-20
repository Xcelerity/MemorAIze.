import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyCTCmasZLkXe-4ZWKfR_o910LqKuhIvgE8",
  authDomain: "memoraize-9aab6.firebaseapp.com",
  projectId: "memoraize-9aab6",
  storageBucket: "memoraize-9aab6",
  messagingSenderId: "1028077298123",
  appId: "1:1028077298123:web:f35538811e24446b0dd64e",
  measurementId: "G-JX03155L69"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}

export { db };

