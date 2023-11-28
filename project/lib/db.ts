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
  getAggregateFromServer,
  average,
  collectionGroup,
  Timestamp,
  orderBy,
  type OrderByDirection,
  QueryConstraint,
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
  value: any
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

export async function getAverage(
  col: string,
  conditionKey: string,
  conditionValue: string,
  averageObject: string
) {
  const colRef = collection(db, col);
  const q = query(colRef, where(conditionKey, "==", conditionValue));
  const snapshot = await getAggregateFromServer(q, {
    avg: average(averageObject),
  });

  return snapshot.data().avg;
}

export async function del(col: string, id: string) {
  const docRef = doc(db, col, id);
  return await deleteDoc(docRef);
}

export async function queryOrderedCollection(
  col: string,
  field: string,
  queryDirection?: OrderByDirection,
  uid: String = ""
) {
  // @ts-ignore
  let fltr: QueryCompositeFilterConstraint | QueryFieldFilterConstraint = where(
    "uid",
    "==",
    uid
  );

  const colRef = collection(db, col);

  const q = query(
    colRef,
    fltr as QueryConstraint,
    orderBy(field, queryDirection)
  );
  const querySnapshot = await getDocs(q);

  const docs = Array.from(querySnapshot.docs).map((doc) => {
    return {
      ...doc.data(),
      id: doc.id,
    };
  });

  return docs;
}

export async function getUser(uid: string) {
  try {
    const doc = await queryCollectionByField("users", "uid", uid);

    if (doc[0]?.hasOwnProperty("username")) {
      return doc[0];
    } else {
      return;
    }
  } catch (e) {
    console.log(e);
  }
}
