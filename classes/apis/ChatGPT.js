const { Configuration, OpenAIApi } = require("openai");
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const csvtojson = require('csvtojson');
const { jsonrepair } = require('jsonrepair');



class ChatGPT
{
    constructor()
    {
        console.log('Constructor chatgpt');
        this.ready=false;
        this.initAPI();
    }

    //Initialices API with keys
    initAPI() {
        const projectDir = process.cwd();
        console.log(projectDir);
        const data =fs.readFileSync(projectDir + '/config/openapi.json', 'utf8')
           
        let configJson = JSON.parse(data);
        this.apiKey = configJson.OPENAI_API_KEY;
        const configuration = new Configuration({
            apiKey: configJson.OPENAI_API_KEY,
            organization: configJson.OPENAI_ORGANIZATION_ID
        });
        this.openai = new OpenAIApi(configuration);
        this.ready=true;
        console.log('READY!');
            




            //console.log('Open AI ready!!');
        
    }

    //Uses openai API to ask a question and receive a response
    async runCompletion(msg,system) {

        if(this.ready)
        {
            let completion, text;

            const keywordArray = [];

            const messages = [ { role: "user", content: msg }];
            if(system){
                messages.unshift({ role: "system", content: system });
            }
            completion = await this.openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages,
                temperature:0.2
            }).then((response) => {

                text = response.data.choices[0].message.content;

            })
                .catch(err => {
                    console.log(err.message);
                    text = "";
                });

            return text;
        }
        else{
            return "";
        }
    }

    //Uses openai API to ask a question and receive a response
    async runCompletionWithMessages(messages) {

        if(this.ready)
        {
            let completion, text;

            const keywordArray = [];

            completion = await this.openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages,
                temperature:0.2
            }).then((response) => {

                text = response.data.choices[0].message.content;

            })
                .catch(err => {
                    console.log(err.message);
                    text = "";
                });

            return text;
        }
        else{
            return "";
        }
    }

    removeDuplicatesByKey(arr, key) {
        const uniqueItems = {};
        console.log('---Cleaning duplicated query items---');
        arr.forEach(item => {
          const keyValue = item[key];
      
          if (!uniqueItems[keyValue]) {
            uniqueItems[keyValue] = item;
          }
        });
      
        return Object.values(uniqueItems);
      }

    async generateProductList(customerQuestion)
    {
        var querylist=[];
        if(customerQuestion!==undefined && customerQuestion!=="")
        {
            
            const system= ``;
            const sentence = 

            `
            This is a request that a customer makes to a clerk in a target store asking for items: 
            "${customerQuestion}"

            Classify the items in the following query types:
                "specific" - Specific item with brand.
                "nobrand" - Specific item with no brand
                "nonspecific" - Non specific item with no brand
                "N/A" - Not looking for an item

            Bring the result in a JSON array with the following structure 
            \`[{"item":item, queryproduct:"", querykind:"", "brand":brand,"category":category}]\` where:
                1. item: name of the item.
                2. queryproduct: the query to use in the database search, include brand.
                3. querykind: what kind of item is most likely the customer is looking for.
                4. brand: brand of the item, "any" if the customer is not specifing a brand
                3. querytype: specific, nobrand, nonspecific, N/A
                If the query has no items respond an empty array.
                
            Consider that: a legacy name or a genericized trademark should be considered the same as the official brand, correct it if needed.
            Do not add additional items, just what the customer is looking for. Return only a valid JSON.    
            `

            let answer = await this.runCompletion(sentence,system);

            console.log('--chat gpt result--');
            console.log('***GTP category ANSWER: '+answer+'***');

            try{
               
                if(answer!=='' && answer!==undefined)
                {

                    let parsedanswer = jsonrepair(answer.replace(/^\s*[^[]*/, "").trim());
                    console.log(parsedanswer);
                    var resultlist=JSON.parse(parsedanswer);
                    if(!Array.isArray(resultlist))
                    {
                        console.log('Not an array');
                        resultlist=[JSON.parse(parsedanswer)];
                    }
                    console.log('Array parsed!',resultlist);
                    for(var product of resultlist)
                    {
                        
                        if(product.item!=='N/A' && product.item!=='' &&  product.item!==undefined)
                        {
                            querylist.push({
                                item:(product.item || '').trim().replace(/['"]/g,""),
                                queryproduct:(product.queryproduct || '').trim().replace(/['"]/g,""),
                                querykind: (product.querykind || '').trim().replace(/['"]/g,""),
                                querytype:(product.querytype || '').trim().replace(/['"]/g,""),
                                querybrand:(product.brand || '').trim().replace(/['"]/g,""),
                                customerQuestion });

                        }
                        
                    }
                    querylist=this.removeDuplicatesByKey(querylist,'queryproduct');
                }
              
            }
            catch(err)
            {
                console.log(err);
                querylist=[];
            }
        }
        return querylist;
    }

    contieneCaracteresIngles(cadena) {
        const regex = /[\u0041-\u005A\u0061-\u007A]/;
        return regex.test(cadena);
    }

    async whisperFile(filePath) {

        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append("model", "whisper-1");
            formData.append("file", fs.createReadStream(filePath));
            //formData.append("language","english");

            axios.post("https://api.openai.com/v1/audio/transcriptions", formData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
                    }
                })
                .then((response) => {

                    console.log(response.data);
                    if (this.contieneCaracteresIngles(response.data)) {
                        resolve(response.data);
                    }
                    else {
                        reject(new Error('Invalid foreign characters'));
                    }
                })
                .catch((error) => {
                    console.log(error);
                    reject(new Error('Unable to transcript'));
                });
        });
    }

    async generateImage(imageDescription)
    {
        console.log("GENERATING IMAGE");
        try{
            const response = await this.openai.createImage({
                prompt: imageDescription,
                n: 1,//# of images
                size: "512x512",//resolution
                });
            let image_url = response.data.data[0].url;
            console.log("URL: ",image_url);
            return image_url;
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async editImage(inputImage,inputMask,editDescription)
    {
        try{
            const response = await this.openai.createImageEdit(
                fs.createReadStream(inputImage),
                editDescription,
                fs.createReadStream(inputMask),
                1,
                "512x512"
            );
            //console.log(response);
            let image_url = response.data.data[0].url;
            console.log('URL: ',image_url);
        }
        catch(err)
        {
            console.log(err);
        }
          
    }

    async createVariations(inputImage)
    {
        try{
            const response = await this.openai.createImageVariation(
                fs.createReadStream(inputImage),
                4,
                "1024x1024"
            );
          let image_url = response.data.data[0].url;
          console.log('URL: ',image_url);
        }
        catch(err)
        {
            console.log(err);
        }
    }

   

}

module.exports = ChatGPT;





