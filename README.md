# cse437

## Dev Instructions
1. Clone The Repo
2. Move into the `project` directory
3. Run `npm install`
4. Run `npm run dev`

## Server Info
* `/api`
  * Contains API paths/event-handlers.
  * Try to minimize the amount of code in here. Each file should look relatively similar.
  * Each request should have its own file with the format `{name}.{method}.ts` (e.g. `register.post.ts`)
  * Place it into the relevant folder (e.g. auth, db)
* `/lib`
  * Where the majority of the backend logic will go
  * Exports functions that the files in `/api` use

### Firebase
https://console.firebase.google.com/project/cse437-46fb9/overview

This is where the database (Firestore) and authentication is handled, and eventually the hosting as well.

### Docs
Using [apidoc](https://github.com/apidoc/apidoc) to generate API docs

View them by visiting the `/docs` path after running `npm run dev` (e.g. http://localhost:3000/docs)

To update the docs:
1. Add/edit comments above any `defineEventHandler` statements according to the correct apidoc syntax ([info](https://apidocjs.com/#params)) 
2. Run `npm install -g apidoc`
3. Run `npm install -D  @types/apidoc`
4. While in the `project` directory, run `apidoc -c public/docs/apidoc.json -i server/api -o public/docs`