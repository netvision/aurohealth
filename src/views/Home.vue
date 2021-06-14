<template>
<Mainmenu />
  <h1 v-on:click="logOut">Home {{group[0]}}</h1>
  <div class="p-d-flex p-flex-wrap p-jc-center">
    <card @click='$router.push({ name: "Ayurved" })' class="p-mr-2 p-mb-2" style="max-width:200px">
      <template #header>
        <img alt="user header" :src="ayurvedCover">
      </template>
      <template #title>
        <router-link to="/ayurved">Ayurved</router-link>
      </template>
      
    </card>
    
    <card @click='$router.push({ name: "Ayurved" })' class="p-mr-2 p-mb-2" style="max-width:200px">
      <template #header>
        <img alt="user header" src="images/homeopathy-cover.jpg">
      </template>
      <template #title>
        <router-link to="/ayurved">Homeopathy</router-link>
      </template>
      
    </card>
    <card @click='$router.push({ name: "Ayurved" })' class="p-mr-2 p-mb-2" style="max-width:200px">
      <template #header>
        <img alt="user header" :src="ayurvedCover">
      </template>
      <template #title>
        <router-link to="/ayurved">Accupressure</router-link>
      </template>
      
    </card>
    <card @click='$router.push({ name: "Ayurved" })' class="p-mr-2 p-mb-2" style="max-width:200px">
      <template #header>
        <img alt="user header" :src="ayurvedCover">
      </template>
      <template #title>
        <router-link to="/ayurved">Physiotharapy</router-link>
      </template>
      
    </card>
  </div>
</template>

<script>
//import axios from 'axios';
import ayurvedCover from '../assets/ayurved.jpg'
import { Auth } from 'aws-amplify';
import Card from 'primevue/card';
//import Button from 'primevue/button';
import Mainmenu from '@/components/Mainmenu.vue'
export default {
  components:{
    Card, Mainmenu
  },
  data() {
    return {
      user: '',
      group: '',
      ayurvedCover
      
    }
  },
  
  async created() {
    this.user = await Auth.currentAuthenticatedUser();
    //const data = { username: 'example' };
    this.group = this.user.signInUserSession.accessToken.payload["cognito:groups"];
    
  },

  methods: {
    async logOut(){
        try{
          await Auth.signOut()
          console.log('loggedOut')
          this.$router.push('/login');
          }
        
         catch(e){
            console.log(e)
          }
    }
  }
  

}

</script>

<style>

</style>