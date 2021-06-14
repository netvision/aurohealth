<template>
    <header>
        <h1>Ayurved</h1>
    </header>
    <div class="p-grid p-mx-auto">
      <div class="p-col-12 p-md-4">
          <Listbox :options="herbs" optionLabel="name" :filter="true">
            <template #option="slotProps">
                <div class="p-d-flex p-jc-between">
                    <div>{{slotProps.option.name}}</div>
                    <div class="p-buttonset">
                        <Button icon="pi pi-user-edit" @click="handleChange(slotProps.option)" class="p-button-text" />
                        <Button icon="pi pi-images" class="p-button-text" @click="addImages(slotProps.option, $event)" />
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
            <OverlayPanel ref="op" :showCloseIcon="true" :dismissable="true">
                <InputText v-model="symptom.description" id="sym" type="text" @keyup.enter="addSymptom" />
            </OverlayPanel>
            <OverlayPanel ref="images" :showCloseIcon="true" :dismissable="true">
                <FileUpload name="demo[]" :customUpload="true" @uploader="uploadFile" />
            </OverlayPanel>
        </div>
    
                
      </div>
      
  </div>
  

</template>

<script>
import axios from 'axios'
import InputText from 'primevue/inputtext';
import Editor from 'primevue/editor';
import Listbox from 'primevue/listbox';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import OverlayPanel from 'primevue/overlaypanel';
import FileUpload from 'primevue/fileupload';
import { Storage } from 'aws-amplify';
export default {
    name: 'Ayurved',
    components:{
        Listbox, InputText, Button, Editor, MultiSelect, OverlayPanel, FileUpload
    },
    data(){
        return{
            herb:{},
            herbs: [],
            herbImages:'',
            symptoms: [],
            symptom:{},
            imgFolder:''
        }
    },
    methods:{
        handleChange(herb) {
            this.herb = herb
            this.herb.symptoms = []
            herb.herbSymptoms.forEach(hs =>{
                let symptom = this.symptoms.filter(ss =>ss.id === hs.symptom_id)
                this.herb.symptoms.push(symptom[0])
            })
            console.log(this.herb)
        },

        async uploadFile(e){
            const file = e.files[0]
            try{
                await Storage.put(this.imgFolder+file.name, file, {
                    contentType: 'image/*'
                })
                this.$refs.images.hide()
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
                }
                catch(e){
                    console.log(e)
                }
            }
            else{
                this.delSymptom(this.herb.id)
                try{
                    //console.log(JSON.stringify(this.herb))
                    const res = await axios.put('https://api.resurgentindia.org/ayurvedic-herbs/'+this.herb.id, this.herb)
                    this.upHerbSymptom(this.herb.symptoms, res.data.id)
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

        addImages(data, e){
           this.imgFolder = 'herb-images/'+data.id+'/'
            this.$refs.images.show(e)
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
        }
    },
    async mounted(){
        let data  = await axios.get('https://api.resurgentindia.org/ayurvedic-herbs?expand=herbSymptoms')
        this.herbs = data.data
        let sym = await axios.get('https://api.resurgentindia.org/symptoms')
        this.symptoms = sym.data
        let image = await Storage.get('homeopathy-Banner.jpg', {
            level: 'public'
        })
        this.herbImages = image
        
        
    }
}
</script>

<style>

</style>