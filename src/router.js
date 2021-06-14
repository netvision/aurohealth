import { createWebHistory, createRouter } from 'vue-router';
import { Auth } from 'aws-amplify';
import Home from '@/views/Home.vue';
import About from '@/views/About.vue';
import Login from '@/views/Login.vue';
import Ayurved from '@/views/Ayurved.vue';

const routes = [
	{
		path: '/',
		name: 'Home',
		component: Home,
		beforeEnter: checkAuth
	},
    {
		path: '/about',
		name: 'About',
		component: About,
		beforeEnter: checkAuth
	},
	{
		path: '/ayurved',
		name: 'Ayurved',
		component: Ayurved,
		beforeEnter: checkAuth
	},
	{
		path: '/login',
		name: 'Login',
		component: Login,
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

async function checkAuth(to, from, next){
	try{
		const user = await Auth.currentAuthenticatedUser();
		if(user) next();
		else next('/login');
	}
	catch(e){
		console.log(e);
		next('/login');
	}
}

export default router;