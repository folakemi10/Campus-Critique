<template>
    <div>
        <GlobalNav :isAuthenticated='isAuthenticated' />
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore';
import { db } from '~/lib/firebase';
import { getProfilePic } from './lib/storage';


const firebaseUser = useFirebaseUser();
const isAdmin = ref(false);
const user = ref();

const isAuthenticated = ref(false);



onMounted(() => {
    checkAdmin();
});

watch(firebaseUser, (newVal, oldVal) => {
    setAuthentication();
    if (newVal) {
        checkAdmin();
    }
});

async function setAuthentication() {
    if (firebaseUser.value !== null) {

        isAuthenticated.value = true;
    } else {
        isAuthenticated.value = false;
    }
}


async function checkAdmin() {
    if (!firebaseUser.value) {
        isAuthenticated.value = false;
        return false;
    }

    if (firebaseUser.value !== null) {
        const uid = firebaseUser.value?.uid as string;
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            console.warn(`users document ${uid} does not exist`);
            return false;
        }

        user.value = docSnap.data();

        if (user.value.admin) {
            isAdmin.value = true;
        }
        else {
            isAdmin.value = false;
        };
    } else {
    }


}

const profilePicUrl = ref('');

const updatePicture = async () => {
    if (firebaseUser.value !== null) {
        profilePicUrl.value = await getProfilePic(firebaseUser.value.uid);
    } else {
        // Handle the case where firebaseUser.value is null
        profilePicUrl.value = '';
    }
};

provide('picture', { profilePicUrl, updatePicture })


</script>