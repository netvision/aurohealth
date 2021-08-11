<template>
  <Mainmenu />
  <Breadcrumb :home="home" :model="pages" />
  <div v-if="herbs">
    <h2 class="p-text-left">जड़ी-बूटियाँ ({{herbs._meta.totalCount}}) <Button icon="pi pi-pencil" label="Add New" class="p-button-sm p-button-outlined" @click="$router.push({ name: 'EditHerb'})" /></h2>
    <div class="p-grid p-nogutter">
    <div style="padding: .5em" class="p-col-12 p-md-4" v-for="item in herbs.items" :key="item.id">
      <Card>
          <template #header>
            <div v-if="item.images">
              <Carousel :value="item.images" :numVisible="1" :numScroll="1" :circular="true" :autoplayInterval="3000">
                <template #item="slotProps">
                  <img :src="slotProps.data" />
                </template>
              </Carousel>
              
            </div>
          </template>
          <template #title>
              {{item.name}}
          </template>
          <template #content>
            
              {{item.common_names}}
          </template>
          <template #footer>
            <p style="width:auto; ">
              <Button icon="pi pi-images" label="Add Photo" class="p-button-sm p-button-outlined" @click="$router.push({ name: 'HerbPhotos', query: { herb_id: item.id }})" />
              <Button icon="pi pi-pencil" label="Edit" class="p-button-sm p-button-outlined" style="margin-left: .5em" @click="$router.push({ name: 'EditHerb', query: { herb_id: item.id }})" />
            </p>
          </template>
        </Card>
      </div>
      </div>
  <Paginator :rows="herbs._meta.perPage" :totalRecords="herbs._meta.totalCount" @page="onPage($event)"></Paginator>
  </div>
</template>

<script>
import axios from 'axios'
import { Storage } from 'aws-amplify';
import Mainmenu from '@/components/Mainmenu.vue'
import Breadcrumb from 'primevue/breadcrumb'
import Paginator from 'primevue/paginator';
import Carousel from 'primevue/carousel';
import Card from 'primevue/card';
import Button from 'primevue/button';
export default {
  components:{
      Mainmenu, Card, Button, Paginator, Breadcrumb, Carousel
    },

  data(){
    return{
      herbs: null,
      home: {icon: 'pi pi-home', to: '/'},
      pages: [
        {label: 'Ayurved', url: '/ayurved'},
        {label: 'Herbs', url: '/ayurved'}
      ]
    }
  },

  methods:{
      async getHerbs(page = null){
          let p = (page) ? page : 1
          const data = await axios.get('https://api.resurgentindia.org/ayurvedic-herbs?per-page=12&sort=name&page='+p)
          this.herbs = data.data
          
          this.herbs.items.map(herb =>{
            if(herb.photos){
              herb.images = []
              let keys = herb.photos.split(', ')
              keys.forEach(async(key) => {
                const src = await Storage.get(key)
                herb.images.push(src)
              })
              return herb.images
            }
          })
          
         console.log(this.herbs.items)
         
      },

    onPage(e){
      this.getHerbs(e.page+1)
    },

    

  },

  created(){
      this.getHerbs()
  }
}
</script>

<style>
.p-card{
  height: 100%;
  position: relative;
  padding-bottom:4rem
}

.p-card-footer{
  position: absolute;
  bottom:1rem
}
.p-carousel-items-content{
  height: inherit;
}
.p-carousel-items-content img{
  height: 10rem;
}
</style>