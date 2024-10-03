import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore'; // Correção na importação

const firebaseConfig = {

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
