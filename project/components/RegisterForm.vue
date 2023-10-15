<template>
    <v-card class="mx-auto" max-width="344" title="User Registration">
        <v-form @submit.prevent="onSubmit">
            <v-container>
                <v-text-field v-model="userInformation.first" :rules="rules.required" color="primary" label="First name"
                    variant="underlined"></v-text-field>

                <v-text-field v-model="userInformation.last" :rules="rules.required" color="primary" label="Last name"
                    variant="underlined"></v-text-field>

                <v-text-field v-model="userInformation.email" :rules="rules.email" color="primary" label="Email"
                    variant="underlined"></v-text-field>

                <v-text-field v-model="userInformation.password" :rules="rules.password" color="primary" label="Password"
                    placeholder="Enter your password" variant="underlined"></v-text-field>

                <v-checkbox v-model="userInformation.terms" color="secondary"
                    label="I agree to site terms and conditions"></v-checkbox>
            </v-container>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn color="success" type="submit">
                    Complete Registration
                    <v-icon icon="mdi-chevron-right" end></v-icon>
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script setup lang="ts">
import { User } from "firebase/auth";
import { set } from "~/lib/db";

const userInformation = ref({
    first: '',
    last: '',
    email: '',
    password: '',
    terms: false,
})

async function onSubmit(event: any) {
    const registerRes = await register(userInformation.value.email, userInformation.value.password);


    const firebaseUser = useFirebaseUser();

    if (firebaseUser.value !== null) {
        addUser(firebaseUser.value, userInformation.value);
        await navigateTo("/");
    } else {
        console.log(firebaseUser.value);
    }
}

async function addUser(firebaseUser: User, userInformation: any) {
    await set("users",
        {
            uid: firebaseUser.uid,
            firstname: userInformation.first,
            lastname: userInformation.last,
            email: userInformation.email,
        })
}


const rules = ref({
    required: [(value: string) => !!value || "Field is required"],
    email: [
        (value: string) => !!value || "Email is required",
        (value: string) => {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(value) || 'Invalid e-mail.'
        }
    ],
    password: [(value: string) => !!value || "Password is required", (value: string) => (value && value.length >= 6) || 'Password must be 6 or more characters',],
});


</script>
