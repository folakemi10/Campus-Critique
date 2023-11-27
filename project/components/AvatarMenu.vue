<template>
    <v-menu min-width="200px" rounded>
        <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
                <Avatar :user='user' v-bind="props" />
            </v-btn>
        </template>
        <v-card>
            <v-card-text>
                <div class="mx-auto text-center">
                    <Avatar :user='user' />
                    <h3>{{ props.user?.firstname + " " + props.user?.lastname }}</h3>
                    <p class="text-caption mt-1">
                        {{ props.user?.email }}
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

const user = ref();

const props = defineProps({
    user: Object,
})

onMounted(async () => {
    user.value = props.user;
    //console.log(props.user);
})

watchEffect(() => {
    user.value = props.user;
    //console.log(props.user); // This should log the user object
});

async function navigateToProfile() {
    await navigateTo('/profile');
}


async function navigateToFriends() {
    await navigateTo('/friends');
}




</script>

