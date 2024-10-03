import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore'; // Correção na importação

const firebaseConfig = {
    apiKey: "AIzaSyDl1hYiMET9fwMlC6Fk5H-r18bvX375Hpk",
  authDomain: "sgto-app.firebaseapp.com",
  projectId: "sgto-app",
  storageBucket: "sgto-app.appspot.com",
  messagingSenderId: "984463071172",
  appId: "1:984463071172:web:71a0b3bdf0bfb077437691",
  measurementId: "G-C5R36TGWDV"

};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Obtenha uma instância do Firestore
const db = getFirestore(app);

// Obtenha uma instância do Auth com persistência no navegador
const auth = getAuth(app);
auth.setPersistence(browserLocalPersistence); // Use a persistência do navegador

// Obtenha uma instância do Storage
const storage = getStorage(app);

// Exporte as instâncias do Firestore, Auth e Storage
export { db, auth, storage };
