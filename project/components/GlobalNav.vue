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

            <MakeReviewBtn :firebaseUser="firebaseUser" />



            <v-btn v-if="!firebaseUser" to="/login">
                Log In
            </v-btn>



            <v-menu min-width="200px" rounded v-if="firebaseUser">
                <template v-slot:activator="{ props }">
                    <v-btn icon v-bind="props">
                        <v-avatar color="brown" size="large">
                            <span class="text-h5">{{ user.initials }}</span>
                        </v-avatar>
                    </v-btn>
                </template>
                <v-card>
                    <v-card-text>
                        <div class="mx-auto text-center">
                            <v-avatar color="brown">
                                <span class="text-h5">{{ user.initials }}</span>
                            </v-avatar>
                            <h3>{{ user.fullName }}</h3>
                            <p class="text-caption mt-1">
                                {{ user.email }}
                            </p>
                            <v-divider class="my-3"></v-divider>
                            <v-btn variant="text" @click="navigateToProfile">
                                Profile
                            </v-btn>
                            <v-divider class="my-3"></v-divider>
                            <LogoutBtn variant="text"/>
                        </div>
                    </v-card-text>
                </v-card>
            </v-menu>



            <!-- <template v-slot:extension>
                <v-tabs v-if="firebaseUser" v-model="tab" align-tabs="right">
                    <v-tab v-for="item in tabItems" :key="item" :value="item" @click="onTabClick(item)">
                        {{ item }}
                    </v-tab>
                </v-tabs>
            </template> -->
        </v-toolbar>
    </v-card>
</template>

<script setup>
import LogoutBtn from './LogoutBtn.vue';

const firebaseUser = useFirebaseUser();

const tabItems = [
    'Home', 'Profile'
];

const tab = ref('Home');

const user = ref({
    initials: 'JD',
    fullName: 'John Doe',
    email: 'john.doe@doe.com',
});

const menuItems = ref([
    { title: 'Click Me' },
    { title: 'Click Me' },
    { title: 'Click Me' },
    { title: 'Click Me 2' },
]);



function onTabClick(tab) {
    if (tab === 'Home') {
        navigateTo('/');
    } else if (tab === 'Profile') {
        navigateTo('/profile');
    }
}

async function navigateToProfile(){
   await navigateTo('/profile');
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
