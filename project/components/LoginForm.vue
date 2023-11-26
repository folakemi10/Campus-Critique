<template>
    <v-container>
        <v-card class="mx-auto" max-width="344" title="Log In">
            <v-form validate-on="submit" @submit.prevent="onSubmit" v-model="valid">
                <v-container>
                    <v-text-field :rules="[rules.required, rules.email]" v-model="userLogin.email" color="primary"
                        label="Email" variant="underlined" required></v-text-field>

                    <v-text-field :rules="[rules.required]" v-model="userLogin.password" color="primary" label="Password"
                        placeholder="Enter your password" variant="underlined" required
                        :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'" :type="show ? 'text' : 'password'"
                        @click:append="show = !show"></v-text-field>
                </v-container>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn color="primary" type="submit" :loading="loading">
                        Log In
                        <v-icon icon="mdi-chevron-right" end></v-icon>
                    </v-btn>

                </v-card-actions>
                <v-alert v-if="incorrectLogin" type="error" outlined>
                    Email or password was incorrect.
                </v-alert>
                <v-alert v-if="emailNotVerified" type="error" outlined>
                    Email is not verified. Please verify your email and refresh the page.
                    <v-btn @click="sendVerificationEmail">Resend Verification Email</v-btn>
                </v-alert>
            </v-form>
            <v-card-actions>Don't have an account? &nbsp; <a href="/register" class="underline text-inherit"> Register
                    here!</a></v-card-actions>
        </v-card>


    </v-container>
</template>

<script setup>

import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be in the authorized domains list in the Firebase Console.
    url: 'campuscritique.vercel.app',
    // This must be true.
    handleCodeInApp: true,
    iOS: {
        bundleId: 'com.example.ios'
    },
    android: {
        packageName: 'com.example.android',
        installApp: true,
        minimumVersion: '12'
    },
    dynamicLinkDomain: 'example.page.link'
};

const incorrectLogin = ref(false);

const userLogin = ref({
    email: "",
    password: "",
});

let loading = ref(false);
let valid = ref();
let show = ref();

const rules = ref({
    required: (value) => !!value || "Field is required",
    email: value => {
        const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return pattern.test(value) || 'Invalid e-mail.'
    },
    passwordRules: value => !!value || "Password is required",
});


async function onSubmit(event) {
    await login(userLogin.value.email, userLogin.value.password);
    const firebaseUser = useFirebaseUser();

    if (firebaseUser.value !== null && valid.value) {
        // Check if the user's email is verified
        if (firebaseUser.value.emailVerified) {
            await navigateTo("/");
        } else {
            // Display an error message or redirect to a page to request email verification
            //sendEmailVerification(firebaseUser);
            console.log("Email is not verified. Please verify your email and refresh the page.");
        }
        //await navigateTo("/");
    } else {
        incorrectLogin.value = true;
        //console.log(firebaseUser.value);
    }
}

const emailNotVerified = computed(() => {
    const firebaseUser = useFirebaseUser();
    return firebaseUser.value !== null && !firebaseUser.value.emailVerified;
});

async function sendVerificationEmail() {
    const firebaseUser = useFirebaseUser();

    if (firebaseUser.value !== null) {
        try {
            await sendEmailVerification(firebaseUser.value);
            console.log("Verification email sent. Please check your inbox.");
        } catch (error) {
            console.error("Error sending verification email:", error);
        }
    }
}

</script>
