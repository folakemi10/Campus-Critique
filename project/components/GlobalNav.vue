<template>
    <v-card color="grey-lighten-4" flat rounded="0">
        <v-toolbar>
            <v-btn to="/">
                <v-toolbar-title>
                    <v-icon icon="mdi-message-draw"></v-icon>
                    Campus Critique
                </v-toolbar-title>
            </v-btn>

            <v-spacer></v-spacer>
            <AvatarMenu v-if="firebaseUser"/>
           
            <div v-if="isAdmin">
                <AdminBtn :button-text="'Admin'" :size="'large'" />
            </div>


            <div v-if="!firebaseUser">
                <LoginBtn :button-text="'Login'" :size="'large'" />
                <RegisterBtn :button-text="'Join'" :size="'large'" />
            </div>


        </v-toolbar>
    </v-card>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore';
import { db } from '~/lib/firebase';


const firebaseUser = useFirebaseUser();
const isAdmin = ref(false);

async function checkAdmin() {
    console.log("Checking Admin");
    if (!firebaseUser.value) {
        return
    }

    const uid = firebaseUser.value?.uid as string;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        console.warn(`users document ${uid} does not exist`);
        return
    }

    const user = docSnap.data();
    console.log(user);
    if (user.admin) {
      isAdmin.value = true;
    }
    else {
      isAdmin.value = false;
    }
    
}

watch(firebaseUser, (newVal, oldVal) => {
    if (newVal) {
        checkAdmin();
    }
});


async function navigateToProfile() {
    await navigateTo('/profile');
}


async function navigateToFriends() {
    await navigateTo('/friends');
}

onMounted(() => {
    checkAdmin();
});


</script>
