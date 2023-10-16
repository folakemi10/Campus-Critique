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

            <v-text-field v-if="firebaseUser" hide-details prepend-icon="mdi-magnify" single-line></v-text-field>

            <v-btn v-if="firebaseUser" to="/review">
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
const firebaseUser = useFirebaseUser();

const tabItems = [
    'Home', 'Profile'
];

const tab = ref('Home');

async function logoutRedirect(){
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
</script>
