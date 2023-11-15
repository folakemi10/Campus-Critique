<template>
    <div>
        <v-avatar color="black" :size="props.size || 'large'">
            <img v-if="hasProfilePicture" :src="profilePicUrl" alt="your profile image">
            <span v-else class="text-h5">{{ getUserInitials() }}</span>
        </v-avatar>
    </div>
</template>


<script setup lang="ts">
import { getProfilePic } from '~/lib/storage';


const hasProfilePicture = ref(true);
const pictureUrl = ref('');

const {
    profilePicUrl,
    updatePicture
} = inject('picture') as any;

const props = defineProps({
    user: Object,
    profilePictureUrl: {
        Type: String,
        default: null
    },
    function: Function,
    size: String,
    isEditable: Boolean,
})

function getUserInitials() {
    if (props.profilePictureUrl !== null) {
        if (props.user?.firstname == null || props.user?.firstname == null) {
            return props.user?.email.charAt(0);
        } else {
            return props.user.firstname?.charAt(0) + props.user.lastname?.charAt(0);
        }
    }
    return '';
}

onMounted(async () => {
    //props.profilePictureUrl?.value = await getProfilePic(props.user?.id);
    if (props.profilePictureUrl === null) {
        hasProfilePicture.value = false;
    }
    updateProfilePicture();
})

async function updateProfilePicture() {
    pictureUrl.value = await getProfilePic(props.user?.id);
}

</script>