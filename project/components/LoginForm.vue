<template>
    <v-container>
        <v-card class="mx-auto" max-width="344" title="Log In">
            <v-form validate-on="submit" @submit.prevent="onSubmit" v-model="valid">
                <v-container>
                    <v-text-field :rules="[rules.required, rules.email]" v-model="userLogin.email" color="primary"
                        label="Email" variant="underlined" required></v-text-field>

                    <v-text-field :rules="[rules.required]" v-model="userLogin.password" color="primary" label="Password"
                        placeholder="Enter your password" variant="underlined" required :append-icon="show ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="show ? 'text' : 'password'" @click:append="show = !show"></v-text-field>
                </v-container>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn color="success" type="submit" :loading="loading">
                        Log In
                        <v-icon icon="mdi-chevron-right" end></v-icon>
                    </v-btn>
                </v-card-actions>
            </v-form>
        </v-card>

        <NuxtLink to="/register">Don't have an account? Register here!</NuxtLink>
    </v-container>
</template>

<script setup>

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
        await navigateTo("/");
    } else {
        console.log(firebaseUser.value);
    }
}
</script>
