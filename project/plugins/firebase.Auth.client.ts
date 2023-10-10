import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initUser } from "~/composables/auth";

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const firebaseConfig = {
    apiKey: "AIzaSyBOVbSES8El9FN5czuT9WIelI1XBu-N9NA",
    authDomain: "cse437-46fb9.firebaseapp.com",
    projectId: "cse437-46fb9",
    storageBucket: "cse437-46fb9.appspot.com",
    messagingSenderId: "418494435440",
    appId: "1:418494435440:web:13cba937ccfea5b416e4b5",
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  initUser();

  const auth = getAuth();

  nuxtApp.vueApp.provide("auth", auth);
  nuxtApp.provide("auth", auth);
});
