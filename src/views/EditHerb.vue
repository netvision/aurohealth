<template>
<Mainmenu />
<Breadcrumb :home="home" :model="pages" />
    <h2 class="p-text-left p-m-2">{{herb.name}}</h2>
    <div class="p-grid p-mx-auto p-shadow-1 p-text-left p-mt-2">
        <div class="p-fluid p-formgrid p-grid p-m-2">
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
                <MultiSelect v-model="herbUses" :options="symptoms" optionLabel="description" display="chip" placeholder="Select symptom" />
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
  

</template>

<script>
import axios from 'axios'
import InputText from 'primevue/inputtext';
import Breadcrumb from 'primevue/breadcrumb'
import Editor from 'primevue/editor';
//import Avatar from 'primevue/avatar';
//import Listbox from 'primevue/listbox';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import OverlayPanel from 'primevue/overlaypanel';
//import FileUpload from 'primevue/fileupload';
import Toast from 'primevue/toast';
import Mainmenu from '../components/Mainmenu.vue';
export default {
    name: 'Ayurved',
    components:{
        InputText, Button, Editor, MultiSelect, OverlayPanel, Toast,
        Mainmenu, Breadcrumb
        //AmplifyS3Album: S3Album
    },
    data(){
        return{
            herb:{},
            symptoms: [],
            symptom:{},
            messages:[],
            herbUses:[],
            home: {icon: 'pi pi-home', to: '/'},
            pages: [
                {label: 'Ayurved', url: '/ayurved'},
                {label: 'Herbs', url: '/ayurved'}
            ]
        }
    },
    methods:{
       async getHerb(id) {
            const res =  await axios.get('https://api.resurgentindia.org/ayurvedic-herbs/'+id)
            this.pages.push({label:res.data.name})
            this.herb = res.data
        },

        async handleSubmit(){
            let use = []
                this.herbUses.forEach(e => {
                    use.push(e.id)
                });
                this.herb.uses = use.join(', ')
            if(!this.herb.id){
                try{
                    //console.log(JSON.stringify(this.herb))
                    const res = await axios.post('https://api.resurgentindia.org/ayurvedic-herbs', this.herb)
                    this.upHerbSymptom(this.herb.symptoms, res.data.id)
                    this.$toast.add({severity:'success', summary: 'Success Message', detail:'Herb Added!', life: 3000});
                }
                catch(e){
                    console.log(e)
                }
                
            }
            else{
                this.delSymptom(this.herb.id)
                try{
                    const res = await axios.put('https://api.resurgentindia.org/ayurvedic-herbs/'+this.herb.id, this.herb)
                    this.upHerbSymptom(this.herbUses, res.data.id)
                    this.$toast.add({severity:'success', summary: 'Success Message', detail:'Herb Updated!', life: 3000});
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

        async getSymptoms(){
            let sym = await axios.get('https://api.resurgentindia.org/symptoms')
            this.symptoms = sym.data
        },

        async herbSymptoms(id){
            let uses = await axios.get('https://api.resurgentindia.org/herb-symptoms?herb_id='+id+'&expand=symptom&fields=symptom')
            uses.data.forEach(use =>{
                this.herbUses.push(use.symptom)
            })
        }

        
    },

    created(){
        this.getSymptoms();
        if(this.$route.query.herb_id) {
          this.getHerb(this.$route.query.herb_id)
          this.herbSymptoms(this.$route.query.herb_id)
        }
        
    }
}
</script>

<style>

</style>