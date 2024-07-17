"use client";

import firebase from "firebase/compat/app";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
let db: Firestore | null = null;
let app: FirebaseApp | null =
  firebase.apps.length > 0 ? firebase.apps?.[0] : null;

if (typeof window !== "undefined") {
  app = !firebase.apps.length ? initializeApp(firebaseConfig) : firebase.app();
}

if (app) {
  db = getFirestore(app);
}

export { db };
