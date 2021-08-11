<template>
    <Toolbar>
    <template #left v-if="user">
        <h2 class="p-text-bold">Integral Health Care System</h2>
    </template>

    <template #right>
        <Button @click="logout" :label="user.username" icon="pi pi-sign-out" class="p-mr-2" />
    </template>
    </Toolbar>
</template>

<script>
import { Auth } from 'aws-amplify';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
export default {
    name: 'Mainmenu',
    components:{
        Toolbar, Button
    },
    data(){
        return{
           user:'' 
        }
    },
    methods:{
        async logout(){
            await Auth.signOut()
            this.$router.push('/login')
        }
    },
    async created(){
        this.user = await Auth.currentAuthenticatedUser()
    }
}
</script>

<style>

</style>