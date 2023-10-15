<template>
    <v-card class="mx-auto" max-width="344" title="Log In">
        <v-form validate-on="submit" @submit.prevent="onSubmit">
            <v-container>
                <v-text-field :rules="[rules.required, rules.email]" v-model="userLogin.email" color="primary" label="Email"
                    variant="underlined" required></v-text-field>

                <v-text-field :rules="[rules.required]" v-model="userLogin.password" color="primary" label="Password"
                    placeholder="Enter your password" variant="underlined" required></v-text-field>
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
</template>

<script setup>


const userLogin = ref({
    email: "",
    password: "",
});

var loading = ref(false);

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

    if (firebaseUser.value !== null) {
        await navigateTo("/");
    } else {
        console.log(firebaseUser.value);
    }
}
</script>
