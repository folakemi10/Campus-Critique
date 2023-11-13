<template>
    <v-avatar color="black" :size="props.size || 'large'">
        <img v-if="hasProfilePicture" :src="profilePictureUrl" alt="your profile image">
        <span v-else class="text-h5">{{ getUserInitials() }}</span>
    </v-avatar>


    <!-- <ProfilePicBtn :uid_prop="props.user?.uid"/> -->
</template>


<script setup lang="ts">
import { getProfilePic } from '~/lib/storage';

const firebaseUser = useFirebaseUser();

const hasProfilePicture = ref(true);
const profilePictureUrl = ref("");

const props = defineProps({
    user: Object,
    function: Function,
    size: String,
})

function getUserInitials() {
    if (firebaseUser.value != null) {
        if (props.user?.firstname == null || props.user?.firstname == null) {
            return props.user?.email.charAt(0);
        } else {
            return props.user.firstname?.charAt(0) + props.user.lastname?.charAt(0);
        }
    }
    return '';
}

onMounted(async () => {
    profilePictureUrl.value = await getProfilePic(props.user?.id);
    if (profilePictureUrl.value === '') {
        hasProfilePicture.value = false;
        profilePictureUrl.value = getUserInitials();
    }
})



function onClick() {

    console.log("clicking avatar");
}


</script>