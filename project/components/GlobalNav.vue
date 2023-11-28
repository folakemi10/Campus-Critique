<template>
    <v-card color="grey-lighten-4" flat rounded="0">
        <v-toolbar>
            <v-btn to="/" variant="plain" :ripple="false">
                <v-toolbar-title>
                    <v-icon icon="mdi-message-draw"></v-icon>
                    <div class="hidden sm:inline ml-2">Campus Critique</div>
                </v-toolbar-title>
            </v-btn>

            <v-spacer></v-spacer>
            <div class="pa-4 d-flex align-center">
                <AdminBtn :button-text="'Admin'" :size="'large'" v-if="isAuthenticated && isAdmin" class="me-2" />
                <MakeReviewBtn v-if="props.isAuthenticated" :firebaseUser="firebaseUser" :isGeneral="`true`" class="me-2" />
                <AvatarMenu v-if="props.isAuthenticated" :user="user" />
            </div>

            <div class="pa-4 d-flex align-center">
                <LoginBtn :button-text="'Login'" :size="'large'" v-if="!props.isAuthenticated" class="me-2" />
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
    checkAdmin();
    if (newVal) {
        checkAdmin();
    }
});

onUpdated(async ()=>{
    checkAdmin();
})

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

    //console.log(user.value);
    if (user.value.admin) {
        isAdmin.value = true;
    }
    else {
        isAdmin.value = false;
    }

}

</script>
