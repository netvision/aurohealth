<template>
    <header>
        <div class="p-grid p-mx-auto">
            <div class="p-col-12">
                <h2 class="p-text-left">Ayurved -> Herb</h2>
            </div>
        </div>
        
    </header>
    <div class="p-grid p-mx-auto">
      <div class="p-col-12 p-md-4">
          <Listbox :options="herbs" optionLabel="name" :filter="true" @filter="filterHerb">
            <template #option="slotProps">
                <div class="p-d-flex p-jc-between">
                    <div>{{slotProps.option.name}}</div>
                    <div class="p-buttonset">
                        <Button icon="pi pi-user-edit" @click="handleChange(slotProps.option)" class="p-button-text" />
                        
                    </div>
                </div>
            </template>
          </Listbox>
      </div>
      <div class="p-col-12 p-md-8 p-shadow-1 p-text-left"> 
          <div class="p-fluid p-formgrid p-grid">
            <div class="p-field p-col-12 p-md-4">
                <label for="firstname">नाम / Name</label>
                <InputText id="firstname" type="text" v-model="herb.name" />
            </div>
            <div class="p-field p-col-12 p-md-8">
                <label for="lastname">अन्य प्रचलित नाम / Common Names</label>
                <InputText id="lastname" type="text" v-model="herb.common_names" />
            </div>
            <div class="p-field p-col-12">
                
                <label for="address">विवरण / Description</label>
                <Editor v-model="herb.description" editorStyle="height: 320px">
                    <template #toolbar>
                        <span class="ql-formats">
                            <button class="ql-header" value="1" type="button"></button>
                            <button class="ql-header" value="2" type="button"></button>
                            <button class="ql-bold"></button>
                            <button class="ql-italic"></button>
                            <button class="ql-underline"></button>
                            <button class="ql-list" value="ordered" type="button"></button>
                            <button class="ql-list" value="bullet" type="button"></button>
                        </span>
                    </template>
                </Editor>
            </div>
            <div class="p-field p-col-10">
                <label for="city">उपयोग / Uses</label>
                <MultiSelect v-model="herb.symptoms" :options="symptoms" optionLabel="description" display="chip" placeholder="Select symptom" />
            </div>
            <div class="p-field p-col-2">
                <label>&nbsp;</label>
                <Button label="New" icon="pi pi-plus" iconPos="left" @click="symptomModal" />
            </div>
            <div class="p-field p-col-12">
                <label for="links">अन्य स्रोत / References</label>
                <InputText id="links" type="text" v-model="herb.links" />
            </div>
            
            <div class="p-field p-col-12 p-md-3">
                <label>&nbsp;</label>
                <Button label="Submit" @click="handleSubmit" />
            </div>
            <div class="p-field p-col-12 p-md-3">
                <label>&nbsp;</label>
                <Button label="Reset" @click="handleReset" />
            </div>
            <OverlayPanel ref="op" :showCloseIcon="true" :dismissable="true">
                <InputText v-model="symptom.description" id="sym" type="text" @keyup.enter="addSymptom" />
            </OverlayPanel>
            
        </div>
        <Toast />
        
      </div>
      
  </div>
  

</template>

<script>
import axios from 'axios'
import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';
//import Avatar from 'primevue/avatar';
import Listbox from 'primevue/listbox';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import OverlayPanel from 'primevue/overlaypanel';
//import FileUpload from 'primevue/fileupload';
import Toast from 'primevue/toast';
import { Storage } from 'aws-amplify';
export default {
    name: 'Ayurved',
    components:{
        Listbox, InputText, Button, Editor, MultiSelect, OverlayPanel, Toast,
        //AmplifyS3Album: S3Album
    },
    data(){
        return{
            herb:{},
            herbs: [],
            herbImages:'',
            symptoms: [],
            symptom:{},
            imgFolder:'',
            messages:[]
        }
    },
    methods:{
        handleChange(herb) {
            this.herb = herb
            this.herb.symptoms = []
            let ss = this.herb.uses.split(', ')
            ss.forEach(hs =>{
                let symptom = this.symptoms.filter(sym =>sym.description === hs)
                this.herb.symptoms.push(symptom[0])
            })
            if(this.herb.photos){
                this.herb.images = this.herb.photos.split(', ')
                this.herb.images.forEach(img =>{
                    this.getImgSrc(img)
                })
            }
            //console.log(this.herb)
        },

        async getImgSrc(key){
            if(!this.herb.imgSrcs) this.herb.imgSrcs = []
            const src = await Storage.get(key)
            this.herb.imgSrcs.push(src)
        },

        async uploadFile(e, f){
            let file = e.files[0]
            this.imgFolder = 'herb-images/'+this.herb.id+'/'
            if(!this.herb.images) this.herb.images = []
            try{
                const result = await Storage.put(this.imgFolder+file.name, file, {
                    contentType: 'image/*'
                })
                f.clear()
                this.herb.images.push(result.key)
                this.getImgSrc(result.key)
                this.$toast.add({severity:'success', summary: 'Success Message', detail:'Files uploaded', life: 3000});
                
            }
            catch (e){
                console.log(e)
            }
        },

        async handleSubmit(){
            let use = []
                this.herb.symptoms.forEach(e => {
                    use.push(e.description)
                });
                this.herb.uses = use.join(', ')
            if(!this.herb.id){
                try{
                    //console.log(JSON.stringify(this.herb))
                    const res = await axios.post('https://api.resurgentindia.org/ayurvedic-herbs', this.herb)
                    this.upHerbSymptom(this.herb.symptoms, res.data.id)
                    this.$toast.add({severity:'success', summary: 'Success Message', detail:'Herb Added!', life: 3000});
                    this.getHerbs()
                }
                catch(e){
                    console.log(e)
                }
                
            }
            else{
                this.delSymptom(this.herb.id)
                try{
                    const res = await axios.put('https://api.resurgentindia.org/ayurvedic-herbs/'+this.herb.id, this.herb)
                    this.upHerbSymptom(this.herb.symptoms, res.data.id)
                    this.$toast.add({severity:'success', summary: 'Success Message', detail:'Herb Updated!', life: 3000});
                    this.getHerbs()
                }
                catch(e){
                    console.log(e)
                }
                
            }
            
        },
        delSymptom(id){
            axios.get('https://api.resurgentindia.org/herb-symptoms/del?id='+id).then(res =>{
                console.log(res.data);
            })
        },
        upHerbSymptom(symptoms, id){
          symptoms.forEach(sm => {
              axios.post('https://api.resurgentindia.org/herb-symptoms', {herb_id: id, symptom_id: sm.id}) 
              .then(res =>{
                  console.log(res.data)
              })
          })  
        },

        symptomModal(e){
             this.$refs.op.toggle(e);
        },
        

        
        /*
        addImages(data, e){
            this.herb = data
            this.imgFolder = 'herb-images/'+this.herb.id+'/'
            let photos = []
            if(this.herb.photos){
                photos = this.herb.photos.split(', ')
            }
            this.$refs.images.show(e)
        },
        */

        async addSymptom(){
            try{
                let data = await axios.post('https://api.resurgentindia.org/symptoms', this.symptom)
                this.symptoms.push(data.data)
                if(this.herb.symptoms && this.herb.symptoms.length > 0) this.herb.symptoms.push(data.data);
                else {
                    this.herb.symptoms = [];
                    this.herb.symptoms.push(data.data)
                }
                this.symptom = {}
            }
            catch(e){
                console.log(e)
            }
            this.$refs.op.hide()
        },

        handleReset(){
            this.herb = {}
        },

        async getHerbs(){
            let data  = await axios.get('https://api.resurgentindia.org/ayurvedic-herbs?per-page=15&sort=-id')
            this.herbs = data.data.items
        },

        async getSymptoms(){
            let sym = await axios.get('https://api.resurgentindia.org/symptoms')
            this.symptoms = sym.data
        },

        async filterHerb(e){
            let q = e.value
            let herbs = await axios.get('https://api.resurgentindia.org/ayurvedic-herbs/search?q='+q)
            this.herbs = herbs.data.items
        }
    },

    created(){
        this.getHerbs()
        this.getSymptoms()
    }
}
</script>

<style>

</style>