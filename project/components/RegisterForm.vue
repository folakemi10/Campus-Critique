<template>
    <v-card class="mx-auto" max-width="480" title="Create an Account" v-if="!showNext">
        <v-form @submit.prevent="next" v-model="valid1">
            <v-container>
                <v-text-field v-model="userInformation.email" :rules="rules.email" color="primary"
                    label="Email"></v-text-field>

                <v-text-field v-model="userInformation.password" :rules="rules.password" color="primary" label="Password"
                    placeholder="Enter your password" :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show ? 'text' : 'password'" @click:append="show = !show"></v-text-field>

                <v-text-field :rules="rules.confirmPasswordRules" color="primary" label="Verify your password"
                    placeholder="Enter your password" type="password"></v-text-field>
            </v-container>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn type="submit">
                    Continue
                    <v-icon icon="mdi-chevron-right" end></v-icon>
                </v-btn>
            </v-card-actions>


        </v-form>
    </v-card>

    <v-card class="mx-auto" max-width="480" title="Tell Us More About Yourself" v-if="showNext">
        <v-form @submit.prevent="onSubmit" v-model="valid2">
            <v-container>
                <v-text-field v-model="userInformation.first" :rules="rules.required" color="primary"
                    label="First name"></v-text-field>

                <v-text-field v-model="userInformation.last" :rules="rules.required" color="primary"
                    label="Last name"></v-text-field>


                <v-text-field v-model="userInformation.username" :rules="rules.required" color="primary"
                    label="Username"></v-text-field>
            </v-container>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn @click="next">
                    <v-icon icon="mdi-chevron-left" end></v-icon>
                    Back
                </v-btn>

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

//Object to hold user registration information
//ref() makes anything reactive, aka anything that used to be held in data()
const userInformation = ref({
    first: '',
    last: '',
    username: '',
    email: '',
    password: '',
})

//validation variable for form
let valid1 = ref();
let valid2 = ref();

//variable to control if password is visible
let show = ref();

//variable to control moving back and forth on the forms
let showNext = ref(false);

//submit user to AUTHENTICATION and then redirect to home
async function onSubmit(event: any) {
    if(valid1.value && valid2.value){
        for(const value in Object.values(userInformation.value)){
            if(value === ''){
                alert("not filled");
            }
        }
        await register(userInformation.value.email, userInformation.value.password);
    }
    const firebaseUser = useFirebaseUser();

    if (firebaseUser.value !== null) {
        addUser(firebaseUser.value, userInformation.value);
        await navigateTo("/");
    } else {
        console.log(firebaseUser.value);
    }
}


//add user to USERS database
async function addUser(firebaseUser: User, userInformation: any) {
    await set("users",
        {
            uid: firebaseUser.uid,
            firstname: userInformation.first,
            lastname: userInformation.last,
            email: userInformation.email,
            username: userInformation.username,
        })
}

function next() {
    if (valid1.value) {
        showNext.value = !showNext.value;
    }
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
    confirmPasswordRules: [
        (value: string) => !!value || 'Password confirmation required',
        (value: string) =>
            value === userInformation.value.password || 'Password does not match',
    ],
});


</script>
