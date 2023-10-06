/*
Adapted from razorcx-courses/nuxt3-firestore-public
https://github.com/razorcx-courses/nuxt3-firestore-public/blob/108d4248c97ab4e8ee4115eddb9a4ad79defac24/server/api/firestore/query.get.ts
*/

import { getQuery } from "h3";
import { del } from "~/server/lib/db";

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);

    await del(query.col as string, query.id as string);

    return { result: query.id }
  } catch (error: any) {
    return { error: error.message }
  }
});