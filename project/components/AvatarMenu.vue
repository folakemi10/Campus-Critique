<template>
    <v-menu min-width="200px" rounded>
        <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
                <v-avatar color="brown" size="large">
                    <span class="text-h5">{{ userInitals }}</span>
                </v-avatar>
            </v-btn>
        </template>
        <v-card>
            <v-card-text>
                <div class="mx-auto text-center">
                    <v-avatar color="brown">
                        <span class="text-h5">{{ userInitals }}</span>
                    </v-avatar>
                    <h3>{{ user.firstname + " " + user.lastname }}</h3>
                    <p class="text-caption mt-1">
                        {{ user.email }}
                    </p>
                    <v-divider class="my-3"></v-divider>
                    <v-btn variant="text" @click="navigateToProfile">
                        Profile
                    </v-btn>
                    <v-divider class="my-3"></v-divider>
                    <v-btn variant="text" @click="navigateToFriends">
                        Friends
                    </v-btn>
                    <v-divider class="my-3"></v-divider>
                    <LogoutBtn variant="text" />
                </div>
            </v-card-text>
        </v-card>
    </v-menu>
</template>

<script setup lang="ts">

import { queryCollectionByField, del } from '~/lib/db';

const firebaseUser = useFirebaseUser();

const user = ref();
const userInitals = ref();


if (firebaseUser.value != null) {
    user.value = await getUser(firebaseUser.value.uid);

    if (user.value.firstname == null || user.value.firstname == null) {
        userInitals.value = user.value.email.charAt(0);
    } else {
        userInitals.value = user.value.firstname?.charAt(0) + user.value.lastname?.charAt(0);
    }

}

async function getUser(uid: string) {
    try {
        const doc = await queryCollectionByField("users", "uid", uid);

        if (doc[0]?.hasOwnProperty('username')) {
            //console.log(doc[0]);
            return doc[0];
        } else {
            return "Anonymous User";
        }
    }
    catch (e) {
        console.log(e);
    }

}

async function navigateToProfile() {
    await navigateTo('/profile');
}


async function navigateToFriends() {
    await navigateTo('/friends');
}


</script>

