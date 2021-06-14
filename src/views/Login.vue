<template>
  <Card style="max-width:40rem; margin: 2em auto;" class="p-shadow-3">
    <template #header>
        <img alt="user header" src="demo/images/usercard.png">
    </template>
    <template #title>
        Please Login
    </template>
    <template #content>
        <div class="p-fluid p-text-left">
            <div class="p-field p-m-2">
                <label for="firstname">Firstname</label>
                <InputText id="firstname" type="text" v-model="username" />
            </div>
            <div class="p-field p-m-2">
                <label for="password" style="margin-left:0">Password</label>
                <Password v-model="password" :feedback="false" toggleMask />
            </div>
        </div>
    </template>
    <template #footer>
        <Button icon="pi pi-check" @click="login" :label="act" />
    </template>
</Card>
</template>

<script>
import { Auth } from 'aws-amplify';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Password from 'primevue/password';
import InputText from 'primevue/inputtext';
export default {
    name: 'Login',
    components: {
        Card, Button, Password, InputText
    },
    data(){
        return{
            username: null,
            password: null,
            act: 'Login'
        }
    },
     
    methods:{
        async login(){
            this.act = 'Please Wait';
            try{
                const user = await Auth.signIn(this.username, this.password);
                console.log(user);
                this.$router.push('/');
            }
            catch(e){
                console.log('couldnt login '+ e)
            }
            
        }
    },

    async created(){
        try{
            const user = await Auth.currentAuthenticatedUser()
            if(user){
                this.$router.push('/')
            }
        }
        catch(e){
            console.log(e)
        }
    }

}
</script>

<style>

</style>