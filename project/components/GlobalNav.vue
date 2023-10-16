<template>
    <v-card color="grey-lighten-4" flat rounded="0">
        <v-toolbar>
            <v-btn to="/">
                <v-toolbar-title>
                    <v-icon icon="mdi-typewriter"></v-icon>
                    Campus Critique
                </v-toolbar-title>
            </v-btn>

            <v-spacer></v-spacer>


            <v-btn v-if="firebaseUser" to="/review" class="text-none text-subtitle-1" color="#5865f2" size="small"
                variant="flat">
                Make a Review
            </v-btn>

            <v-btn v-if="!firebaseUser" to="/login">
                Log In
            </v-btn>

            <v-btn @click="logoutRedirect" v-if="firebaseUser">
                Log Out
            </v-btn>

            <template v-slot:extension>
                <v-tabs v-if="firebaseUser" v-model="tab" align-tabs="right">
                    <v-tab v-for="item in tabItems" :key="item" :value="item" @click="onTabClick(item)">
                        {{ item }}
                    </v-tab>
                </v-tabs>
            </template>
        </v-toolbar>
    </v-card>
</template>

<script setup>
//for search bar in nav
import { queryEntireCollection } from '~/lib/db';

const firebaseUser = useFirebaseUser();

const tabItems = [
    'Home', 'Profile'
];

const tab = ref('Home');

async function logoutRedirect() {
    logout();
    await navigateTo("/");
}

function onTabClick(tab) {
    if (tab === 'Home') {
        navigateTo('/');
    } else if (tab === 'Profile') {
        navigateTo('/profile');
    }
}


// const allCourses = ref();

// const selected = ref();

// onMounted(async () => {
//     allCourses.value = await queryEntireCollection('classes');
// }
// );


// // watch works directly on a ref
// watch(selected, async () => {
//     await navigateTo({
//         path: '/details/',
//         query: {
//             id: selected.value.id,
//         },
//         replace: true,
//     })
// })

</script>
