/*
Adapted from razorcx-courses/nuxt3-firestore-public
https://github.com/razorcx-courses/nuxt3-firestore-public/blob/108d4248c97ab4e8ee4115eddb9a4ad79defac24/server/api/firestore/query.get.ts
*/

import { getQuery } from "h3";
import { queryEntireCollection, queryCollectionByField } from "~/server/lib/db";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const docs = await queryEntireCollection(query.col as string);
    // const docs = await queryCollectionByField(query.col as string, "name", "test");
    return { result: docs };
  } catch (error: any) {
    return { result: [], error: error.message };
  } 
});