<template>
<Mainmenu />
<Breadcrumb :home="home" :model="pages" />
<panel :header="herb.name">
    <template #icons>
        <FileUpload :ref="el => this.upload = el" mode="basic" auto=true name="demo[]" :customUpload="true" @uploader="myUploader" />
    </template>
    <div v-if='images' class="p-grid">
        <template v-for="(img, i) in images" :key="i">
           <div class="p-col-4" style="position:relative">
               <img :src="img.src" style="width:100%; height:12rem; object-fit:cover; position:relative" />
               <Button icon="pi pi-trash" class="p-button-rounded p-button-secondary" style="z-index:5; right: 1em; top: 1em; display: block; position: absolute;" @click="delImage(img, i)" />
           </div>
        </template>
    </div>
</panel>  
</template>

<script>
import axios from 'axios'
import Mainmenu from '@/components/Mainmenu.vue'
import Breadcrumb from 'primevue/breadcrumb'
import { Storage } from 'aws-amplify';
import Panel from 'primevue/panel';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
export default {
    components:{
        Mainmenu, Panel, FileUpload, Button, Breadcrumb
    },

    data(){
        return{
            herb: {},
            images: [],
            home: {icon: 'pi pi-home', to: '/'},
            pages: [
                {label: 'Ayurved', url: '/ayurved'}
            ]
        }
    },

    methods:{
        async getHerb(id){
            const herb = await axios.get('https://api.resurgentindia.org/ayurvedic-herbs/'+id)
            return  herb.data
        },
        
        async getImgSrc(photos = null){
            let images = []
            if(photos){
                const imgs = photos.split(', ')
                for(let img of imgs){
                    if(img !== 'null'){
                    const src = await Storage.get(img)
                    images.push({key: img, src: src})
                    }
                }
            }
            this.images = images 
        },

        async myUploader(e){
            const file = e.files[0];
            const path = 'herb-images/'+this.herb.id+'/'+file.name
            try {
                const out = await Storage.put(path, file, {
                contentType: 'image/*' // contentType is optional
                });
                const src = await Storage.get(out.key)
                this.images.push({key: out.key, src: src})
                let photos = []
                this.images.forEach(image =>{
                    photos.push(image.key)
                })   
                this.herb.photos = photos.join(', ')         
                console.log(this.herb.photos)
                await axios.put('https://api.resurgentindia.org/ayurvedic-herbs/'+this.herb.id, this.herb)
                this.upload.clear();
                
            } catch (error) {
                console.log('Error uploading file: ', error);
            }
            
        },

        async delImage(img, i){
            this.images.splice(i, 1)
            await Storage.remove(img.key)
            let photos = []
            this.images.forEach(image =>{
                photos.push(image.key)
            })
            this.herb.photos = photos.join(', ')
            await axios.put('https://api.resurgentindia.org/ayurvedic-herbs/'+this.herb.id, this.herb)
            console.log(this.images)
        }

    },

    async created(){
        let herb_id = this.$route.query.herb_id
        this.herb = await this.getHerb(herb_id)
        this.pages.push({label: this.herb.name, url: '/edit-herb?herb_id='+this.herb.id}, {label: 'Photos'})
        this.getImgSrc(this.herb.photos)
        console.log(this.herb.photos)
    }
}
</script>

<style>

</style>