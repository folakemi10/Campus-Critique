import { Auth } from "firebase/auth";

export default defineNuxtPlugin(() => {
  addRouteMiddleware("auth", (to, from) => {
    const nuxtApp = useNuxtApp();
    const auth = nuxtApp.$auth as Auth | null;

    // if (auth?.currentUser?.uid && to.path !== '/admin') {
    // TODO: PROPERLY IMPLEVENT PROTECTION FOR ADMIN ROUTE
    if (auth?.currentUser?.uid) {
      return navigateTo("/");
    }
    else if (!auth?.currentUser?.uid && to.path !== '/'){
        return navigateTo('/')  
      }
      return
  });
});
