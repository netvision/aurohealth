<template>
  <amplify-authenticator>
    <router-view />
    <!-- The rest of your app code -->
    <amplify-sign-out></amplify-sign-out>
  </amplify-authenticator>
</template>

<script>

export default {
  name: 'App',
  components: {
    
  },
  
  
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
