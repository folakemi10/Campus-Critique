<template>
    <v-card class="mx-auto" max-width="344" title="Log In">
        <v-form validate-on="submit lazy" @submit.prevent="submit">
            <v-container>

                <v-text-field v-model="email" color="primary" label="Email" variant="underlined"
                    :rules="rules"></v-text-field>

                <v-text-field v-model="password" color="primary" label="Password" placeholder="Enter your password"
                    variant="underlined" :rules="rules"></v-text-field>

            </v-container>

            <v-divider></v-divider>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn color="success"  type="submit">
                    Log In
                    <v-icon icon="mdi-chevron-right" end></v-icon>
                </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>


<script>
export default {
    data: vm => ({
        loading: false,
        rules: [value => vm.checkApi(value)],
        timeout: null,
        email: '',
        password: '',
    }),

    methods: {
        async submit(event) {
            this.loading = true

            const results = await event

            this.loading = false

            //alert(JSON.stringify(results, null, 2))
            
        },
        async checkApi(email) {
            return new Promise(resolve => {
                clearTimeout(this.timeout)

                this.timeout = setTimeout(() => {
                    if (!email) return resolve('Please enter a user name.')
                    if (email === 'johnleider') return resolve('User name already taken. Please try another one.')

                    //return resolve(true)

                    navigateTo({ path: '/loggedin' })
                }, 200)
            })
        },
    },
}
</script>
  