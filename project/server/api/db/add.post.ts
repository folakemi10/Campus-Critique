/*
Adapted from razorcx-courses/nuxt3-firestore-public
https://github.com/razorcx-courses/nuxt3-firestore-public/blob/108d4248c97ab4e8ee4115eddb9a4ad79defac24/server/api/firestore/query.get.ts
*/

import { getQuery, readBody } from "h3";
import { add } from "~/server/lib/db";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const body = await readBody(event);
    console.log(body);

    const docRef = await add(query.col as string, body);

    return { result: docRef };
  } catch (error: any) {
    return { error: error.message }
  } 
});