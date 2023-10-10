<template>
    <v-card class="mx-auto" max-width="344" title="User Registration">
        <v-form @submit.prevent="submit">
            <v-container>
                <v-text-field v-model="userInformation.first" color="primary" label="First name"
                    variant="underlined"></v-text-field>

                <v-text-field v-model="userInformation.last" color="primary" label="Last name"
                    variant="underlined"></v-text-field>

                <v-text-field v-model="userInformation.email" color="primary" label="Email"
                    variant="underlined"></v-text-field>

                <v-text-field v-model="userInformation.password" color="primary" label="Password"
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
const userInformation = ref({
    first: '',
    last: '',
    email: '',
    password: '',
    terms: false,
})

function submit(event: any) {
    register(userInformation.value.email, userInformation.value.password);

    navigateTo('/');
}
</script>
