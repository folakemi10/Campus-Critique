<template>
     <GlobalNav logged-in=false />
    <h1 class="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
      Welcome to Campus Critique!</h1>

    <div class="flex justify-center">
      <v-btn to="/login">
        Get Started
      </v-btn>
      <v-text-field label="Search" placeholder="Search for a course or professor" type=""></v-text-field>
      
    </div>

</template>
  
<script>


</script>

<style scoped></style>