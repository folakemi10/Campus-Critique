/*
Adapted from razorcx-courses/nuxt3-firestore-public
https://github.com/razorcx-courses/nuxt3-firestore-public/blob/108d4248c97ab4e8ee4115eddb9a4ad79defac24/server/api/firestore/query.get.ts
*/

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
  collectionGroup,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export async function queryEntireCollection(col: string) {
  // @ts-ignore
  const colRef = collection(db, col);

  const snapshot = await getDocs(colRef);

  const docs = Array.from(snapshot.docs).map((doc) => {
    return {
      ...doc.data(),
      id: doc.id,
    };
  });

  return docs;
}

export async function queryCollectionByField(
  col: string,
  field: string,
  value: Object
) {
  const colRef = collection(db, col);

  const q = query(colRef, where(field, "==", value));
  const docs = await getDocs(q);

  const result = Array.from(docs.docs).map((doc) => {
    return {
      ...doc.data(),
      id: doc.id,
    };
  });

  return result;
}

export async function set(col: string, document: Object) {
  await setDoc(doc(collection(db, col)), document, { merge: true });
}

export async function add(col: string, document: Object) {
  // @ts-ignore
  const colRef = collection(db, col);

  const docRef = await addDoc(colRef, document);

  return docRef;
}

export async function del(col: string, id: string) {
  const docRef = doc(db, col, id);
  return await deleteDoc(docRef);
}
