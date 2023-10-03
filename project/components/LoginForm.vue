<template>
    <v-sheet max-width="300" class="mx-auto">
        <v-form validate-on="submit lazy" @submit.prevent="submit">
            <v-text-field v-model="email" :rules="rules" label="Email"></v-text-field>
            <v-text-field v-model="password" :rules="rules" label="Password"></v-text-field>
            <v-btn :loading="loading" type="submit" block class="mt-2" text="Submit"></v-btn>
        </v-form>
    </v-sheet>
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

                    navigateTo({ path: '/loggedin'})

                    //return resolve(true)
                }, 200)
            })
        },
    },
}
</script>
  