<template>
    <!-- Debug Info -->
    <div id="debug_info">
        {{user_info}}
    </div>

    <!-- Login -->
    <div id="debug_login">
        <v-sheet max-width="300" class="mx-auto">
            <v-form validate-on="submit lazy" @submit.prevent="submit_login()">
                <v-text-field v-model="email" label="Email"></v-text-field>
                <v-text-field v-model="password" label="Password"></v-text-field>
                <v-btn type="submit" block class="mt-2" text="Login"></v-btn>
            </v-form>
        </v-sheet>
    </div>
    
    <!-- Logout -->
    <div id="debug_logout">
        <v-form validate-on="submit lazy" @submit.prevent="submit_logout()">
            <v-btn type="submit" block class="mt-2" text="Logout"></v-btn>
        </v-form>
    </div>
    
    <!-- Status -->
    <div id="debug_status">
        <v-form validate-on="submit lazy" @submit.prevent="submit_status()">
            <v-btn type="submit" block class="mt-2" text="Status"></v-btn>
        </v-form>
        
    </div>

    <ProfilePicBtn :uid_prop="uid" />

</template>


<script lang="ts">
import { auth_status } from '~/composables/auth';
import { getFiles, getProfilePic } from '~/lib/storage';

export default {
data() {
    return {
        email: "test@example.com",
        password: "password",
        user_info: "",
        image_url: "",
        firebaseUser: useFirebaseUser(),
        uid: ""
    }
},
methods: {
    async submit_login() {
        const user = await login(this.email, this.password);
        this.user_info = JSON.stringify(user);
    },
    async submit_logout() {
        const result = await logout();
        this.user_info = JSON.stringify(result);
    },
    async submit_status() {
        const user = await auth_status();
        this.user_info = JSON.stringify(user);
    },
    async get_pfp() {
        this.image_url = await getProfilePic(this.uid);
    },
    async get_files() {
        await getFiles("gMnhQ8plOk9OUZNj4TBw");
    }
},
watch: {
    firebaseUser(newValue, oldValue) {
        if (newValue) {
           this.uid = this.firebaseUser?.uid as string;
           this.get_pfp();
           this.get_files();
        }
    }
}
}
</script>
  