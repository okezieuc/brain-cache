import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCaPfMGOEqGprE38lUSh8iz8JHyM5iUjt4",
  authDomain: "brain-cache-ca37e.firebaseapp.com",
  projectId: "brain-cache-ca37e",
  storageBucket: "brain-cache-ca37e.appspot.com",
  messagingSenderId: "293427946634",
  appId: "1:293427946634:web:d5dd08765e6d94319e3973",
};

const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
