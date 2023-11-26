<template>
    <v-card color="grey-lighten-4" flat rounded="0">
        <v-toolbar>
            <v-btn to="/" variant="plain" :ripple="false">
                <v-toolbar-title>
                    <v-icon icon="mdi-message-draw"></v-icon>
                    Campus Critique
                </v-toolbar-title>
            </v-btn>

            <v-spacer></v-spacer>
            <!-- <MakeReviewBtn v-if="props.isAuthenticated" :firebaseUser="firebaseUser" :isGeneral="`true`"/> -->


            <AvatarMenu v-if="props.isAuthenticated" :user="user" />


            <AdminBtn :button-text="'Admin'" :size="'large'" v-if="isAdmin" />


            <div class="pa-4 d-flex align-center">
                <LoginBtn :button-text="'Login'" :size="'large'" v-if="!props.isAuthenticated" class="me-2"/>
                <RegisterBtn :button-text="'Join'" :size="'large'" v-if="!props.isAuthenticated" />
            </div>
        </v-toolbar>
    </v-card>
</template>

<script setup lang="ts">
import { doc, getDoc } from 'firebase/firestore';
import { db } from '~/lib/firebase';


const firebaseUser = useFirebaseUser();
const isAdmin = ref(false);
const user = ref();


const props = defineProps({
    isAuthenticated: Boolean,
    key: Number,
})


onMounted(() => {
    checkAdmin();
});

watch(firebaseUser, (newVal, oldVal) => {
    if (newVal) {
        checkAdmin();
    }
});

async function checkAdmin() {
    if (!firebaseUser.value) {
        return false;
    }
    const uid = firebaseUser.value?.uid as string;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        console.warn(`users document ${uid} does not exist`);
        return false;
    }

    user.value = docSnap.data();
    //console.log(user);
    if (user.value.admin) {
        isAdmin.value = true;
    }
    else {
        isAdmin.value = false;
    }
    ;
}

</script>
