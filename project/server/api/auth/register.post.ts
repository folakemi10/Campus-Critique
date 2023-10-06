import { getQuery, readBody } from "h3";
import { register } from "~/server/lib/auth";

export default defineEventHandler(async (event) => {
    console.log(event.path);  // log request

    // parse request event
    const query = getQuery(event);
    const body = await readBody(event);

    console.log(body);  // log body

    try {
        // parse request body
        const email: string = body.email;
        const password: string = body.password;
        return register(email, password);
    }
    catch(error: any) {
        return error;  // if can't parse email or username from body
    }
});
