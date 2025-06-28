<template>
  <div id="app">
    <!-- Router tarafından yönetilen görünümler burada render edilecek -->
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style>
/* Global CSS stilleri */
body {
  margin: 0;
  background-color: #f4f6f9; /* Hafif bir arka plan rengi */
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>