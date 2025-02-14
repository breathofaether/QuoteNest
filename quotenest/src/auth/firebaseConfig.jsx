import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc, } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCLTNk1F9Ca9AQl42nlHrt8bGv96F7h3js",
    authDomain: "momentum-1cd81.firebaseapp.com",
    projectId: "momentum-1cd81",
    storageBucket: "momentum-1cd81.firebasestorage.app",
    messagingSenderId: "875039232081",
    appId: "1:875039232081:web:e4d6660ef20c9f4842e870"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const registerUser = async (email, password, username) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
  
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      username: username,
      createdAt: new Date(),
    });
  
    return user;
  };

export const loginUser = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

