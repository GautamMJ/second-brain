import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with YOUR Firebase config from Step 1B
const firebaseConfig = {
  apiKey: "AIzaSyA902wd-TYIGnEUH_vP4utxFWYFe_Hb34I",
  authDomain: "second-brain-ed40e.firebaseapp.com",
  projectId: "second-brain-ed40e",
  storageBucket: "second-brain-ed40e.firebasestorage.app",
  messagingSenderId: "248516548042",
  appId: "1:248516548042:web:5b9586ed760bae3170eb33",
  measurementId: "G-0QZRT0YH0F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
