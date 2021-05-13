<template>
  <h1>Home {{user.username}}</h1>
</template>

<script>
import { Auth } from 'aws-amplify';
export default {
    async created() {

    this.user = await Auth.currentAuthenticatedUser();
    console.log(this.user)
    console.log(this.user.signInUserSession.accessToken.payload["cognito:groups"]);
    
  },
  data() {
    return {
      user: undefined,
      
    }
  },

}

</script>

<style>

</style>