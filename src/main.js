import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import PrimeVue from 'primevue/config';

import 'primevue/resources/themes/saga-blue/theme.css'       //theme
import 'primevue/resources/primevue.min.css'                 //core css
import 'primeicons/primeicons.css'  
import 'primeflex/primeflex.css';                         //icons

import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';
import {
  applyPolyfills,
  defineCustomElements, 
} from '@aws-amplify/ui-components/loader';

applyPolyfills().then(() => {
  defineCustomElements(window);
});
Amplify.configure(awsconfig);

const app = createApp(App);

app.use(router);
app.use(PrimeVue);



app.mount('#app');
