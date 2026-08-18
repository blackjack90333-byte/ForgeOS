// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
  Unsubscribe,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { NofapLink, UserDocument,BodyMetric,EisenhowerTask } from "../types";
// В src/services/firebase.ts
// import { EisenhowerTask } from "../types";

export const saveEisenhowerTasks = async (userId: string, tasks: EisenhowerTask[]) => {
  const userDocRef = doc(db, "users", userId);
  await updateDoc(userDocRef, {
    eisenhower_tasks: JSON.stringify(tasks),
  });
};
// import { BodyMetric } from "../types";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export const listenToAuthChanges = (
  callback: (user: FirebaseUser | null) => void
): Unsubscribe => {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

export const getUserData = async (uid: string): Promise<UserDocument | null> => {
  try {
    if (!uid) {
      throw new Error("UUID пользователя не указан");
    }

    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserDocument;
    } else {
      console.log("Пользователь не найден");
      return null;
    }
  } catch (error: any) {
    console.error("Ошибка при получении данных пользователя:", error.message);
    throw error;
  }
};

export const updateUserData = async <K extends keyof UserDocument>(
  userId: string,
  fieldName: K,
  value: UserDocument[K]
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      { [fieldName]: value },
      { merge: true }
    );
    console.log(`Поле "${String(fieldName)}" успешно обновлено для пользователя ${userId}`);
  } catch (error: any) {
    console.error("Ошибка при обновлении данных пользователя:", error.message);
    throw error;
  }
};

export const addLinkToUser_nofap = async (
  userId: string,
  linkData: NofapLink
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      nofap_links: arrayUnion(linkData),
    });
    console.log(`Ссылка успешно добавлена для пользователя ${userId}`);
  } catch (error: any) {
    console.error("Ошибка при добавлении ссылки:", error.message);
    throw error;
  }
};

export const removeLinkFromUser_nofap = async (
  userId: string,
  linkData: NofapLink
): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      nofap_links: arrayRemove(linkData),
    });
    console.log(`Ссылка успешно удалена для пользователя ${userId}`);
  } catch (error: any) {
    console.error("Ошибка при удалении ссылки:", error.message);
    throw error;
  }
};

export const addBodyMetric = async (userId: string, metric: BodyMetric) => {
  const userDocRef = doc(db, "users", userId);
  await updateDoc(userDocRef, {
    body_metrics: arrayUnion(metric),
  });
};

export const removeBodyMetric = async (userId: string, metric: BodyMetric) => {
  const userDocRef = doc(db, "users", userId);
  await updateDoc(userDocRef, {
    body_metrics: arrayRemove(metric),
  });
};

// В src/services/firebase.ts
export const setUserHeight = async (userId: string, height: number) => {
  const userDocRef = doc(db, "users", userId);
  await updateDoc(userDocRef, {
    user_height: height,
  });
};

export { auth, provider, signInWithPopup, db, signOut };