const projectDir = process.cwd();
const OrderQueries = require(projectDir+'/classes/controllers/OrderQueries.js');
var childProcess = require('child_process');
const fs = require('fs');
const path = require('path');
const URL = require('url');
const axios = require('axios');
const {v4:uuid} = require('uuid'); // I chose v4 ‒ you can select others
const Mailer = require(projectDir+'/classes/apis/Mailer.js');
let mailer = new Mailer();
//Process order and generate images
const imagepaths = require(projectDir+'/classes/controllers/ImagePaths.js');
console.log('***PATHS***');
console.log(imagepaths);
let orderQueries = new OrderQueries();
//Generic functions 
function getNameFromUrl(fileUrl) {
    const parsedUrl = URL.parse(fileUrl);
    const pathname = parsedUrl.pathname;
    const folders = pathname.split('/').filter(folder => folder !== '');
    const extension = pathname.split('.').pop();
   /* console.log('folder: ',folders[folders.length - 2]);
    console.log('ext: ',extension);
    console.log('id:',  folders[folders.length - 2]+'.'+extension);*/

    if (folders.length > 0) {
      return folders[folders.length - 2]+'.'+extension;
    } else {
      return null;
    }
  }


  async function downloadImage(url, filename) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
  
    await fs.writeFile(filename, response.data, (err) => {
      if (err)
      {
        console.error('Error downloading file!'+filename);
      }
      console.log('Image downloaded: '+filename);
    });
  }
  


class GalleryManager
{
    constructor()
    {

        
        this.promptsPerImage=5;
        this.maxActivePrompts=3;

        this.speed='';//fast
        //this.speed='--relax';
     
        this.activePrompts=0;
        
    
        this.activeOrders=[];
        this.uploadImagePath= imagepaths.uploadImagePath;
        this.galleryImagePath = imagepaths.galleryImagePath;
        this.imagehost = imagepaths.prodhost;
        this.proddir = imagepaths.proddir;

        //this.enabledPrompts=[0,1,2,3,4];
        this.enabledPrompts=[2];
        this.activeProcess={};
        //this.uploadImagePath="/front/public_html/images/tmp/";
        //this.galleryImagePath="/front/public_html/images/gallery/";
        //this.imagehost = 'https://profoodshots.com:3000/';//hostname used on discord to process images
       
    }



    uploadCustomerPhoto(req,res)
    {
        console.log('Upload image to server...');
        if (!req.files) {
            return res.status(400).send("No files were uploaded.");
        }

        console.log(req.files);
        const file = req.files.image;
        const fileextension =file.name.split('.').pop();
        var serverfilename = uuid()+'.'+fileextension; //file.name is the local file name
        console.log('Server filename: ',serverfilename)
        const directorypath = this.proddir +  this.uploadImagePath + serverfilename;
   
        // Define the destination path where you want to save the file
        console.log(serverfilename);
        file.mv(directorypath, (err) => {
            if (err) {
            console.log('Error moving file, check folder permissions!')
            console.error(err);
             return res.status(500).send(err);
            }
            return res.send({ status: "success",imagehost:this.imagehost, imagepath: "images/tmp/"+serverfilename });
        });
    }

    
    promptFromIndex(params)
    {
        let prompt;
        var ingredientsString='';
        var ingredientsParams='';

         //MJ seed
       
        if(params.ingredients!==undefined && params.ingredients.length>0)
        {
            ingredientsParams = params.ingredients.map(item => `"` + item.replace(/\s+/g,'-') + '",').join('');
            ingredientsParams = ingredientsParams.slice(0, -1);
            ingredientsString+= ingredientsParams;
        }

        if(params.promptIndex==0)
        {
            params.imageWeight=1.9;
            params.stylization= 30;
            prompt = params.imageurl+` Improve this photo's lighting, color, and clarity to match the quality of a "professional food" photograph taken with dslr 50mm 2f lens on a "cozy atmophere"`+
            ` --seed ${params.promptseed} --iw ${params.imageWeight} --s ${params.stylization} --style raw --ar 3:2 --no fonts,letters,text,watermark,slogans,typography,signature `+this.speed;

            return prompt;
        }
        else if(params.promptIndex==1)
        {
            params.imageWeight=1.9;
            params.stylization= 100;
            prompt = params.imageurl+` Improve this photo's lighting, color, and clarity to match the quality of a "professional food" photograph taken with dslr 50mm 2f on a "cozy atmophere"`+
            ` --seed ${params.promptseed} --iw ${params.imageWeight} --s ${params.stylization} --style raw --ar 3:2 --no fonts,letters,text,watermark,slogans,typography,signature `+this.speed;

            return prompt;
        }
        else if(params.promptIndex==2)
        {
            params.imageWeight=1.9;
            params.stylization= 250;
            prompt = params.imageurl+` Improve this photo's lighting, color, and clarity to match the quality of a "professional food" photograph taken with dslr 50mm 2f on a "cozy atmophere"`+
            ingredientsString + ` --seed ${params.promptseed} --iw ${params.imageWeight} --s ${params.stylization} --style raw --ar 3:2 --no fonts,letters,text,watermark,slogans,typography,signature `+this.speed;
            
            return prompt;
        }
        else if(params.promptIndex==3)
        {
            params.imageWeight=1.8;
            params.stylization= 150;
            prompt = params.imageurl+` Improve this photo's lighting, color, and clarity to match the quality of a "professional food" photograph taken with dslr 50mm 2f on a "cozy atmophere"`+
            ingredientsString + ` --seed ${params.promptseed} --iw ${params.imageWeight} --s ${params.stylization} --style raw --ar 3:2 --no fonts,letters,text,watermark,slogans,typography,signature `+this.speed;
            return prompt;
        }
        else{
            params.imageWeight=1.8;
            params.stylization= 300;
            prompt = params.imageurl+` Improve this photo's lighting, color, and clarity to match the quality of a "professional food" photograph taken with dslr 50mm 2f on a "cozy atmophere"`+
            ingredientsString + ` --seed ${params.promptseed} --iw ${params.imageWeight} --s ${params.stylization} --style raw --ar 3:2 --no fonts,letters,text,watermark,slogans,typography,signature `+this.speed;
  
       
            return prompt;
        }
      
     
    }

    async generateImages(scriptPath, params) 
    {
        // keep track of whether callback has been invoked to prevent multiple invocations
        var invoked = false;
        console.log('Prompt params');
        console.log(params);

        return new Promise((resolve, reject) => {

            try 
            {//create order id directory
                var prompt = this.promptFromIndex(params);
                const resultPath=this.proddir+this.galleryImagePath;

                if(!prompt)
                {
                // callback(new Error('No prompt'));
                    reject(new Error(`No prompt`));
                }
                
                console.log('Creating dir...');
                if (!fs.existsSync(resultPath+params.orderid)) {
                    fs.mkdirSync(resultPath+params.orderid);
                }
                console.log('Starting process');

           
                var process = childProcess.fork(scriptPath,[params.promptseed,prompt]);
                console.log(process.pid);
                
                this.activeProcess[process.pid]=true;
                process.send('Waiting for child response');
        
                // listen for errors as they may prevent the exit event from firing
                process.on('message', async  (result)=> {
                    
                    try{//Catch file download possible errors
                        if(result && result!=='')
                        {
                            console.log('Downloading images to server: ', result);
                            const serverurl1=params.orderid+'/'+getNameFromUrl(result.url1);
                            const serverurl2=params.orderid+'/'+getNameFromUrl(result.url2);
                            const serverurl3=params.orderid+'/'+getNameFromUrl(result.url3);
                            const serverurl4=params.orderid+'/'+getNameFromUrl(result.url4);
                            
                            //Save prompt seed and result.imageseed for debug purposes here 
                            //param.promptseed and result.url1 to 4

                            await downloadImage(result.url1,resultPath+serverurl1);
                            await downloadImage(result.url2,resultPath+serverurl2);
                            await downloadImage(result.url3,resultPath+serverurl3);
                            await downloadImage(result.url4,resultPath+serverurl4);

                        // callback(false,[serverurl1,serverurl2,serverurl3,serverurl4]);
                            if(this.activeProcess[process.pid])
                                delete this.activeProcess[process.pid];
                        // callback(err);
                            resolve([serverurl1,serverurl2,serverurl3,serverurl4])
                        }
                        else{
                            console.error('***Unable to complete prompt**');
                            if(this.activeProcess[process.pid])
                                 delete this.activeProcess[process.pid];
                    // callback(err);
                            reject(new Error(`Empty results`));
                           
                        }
                        
                    }
                    catch(err)
                    {
                        console.error('Error generating images',err);
                        if(this.activeProcess[process.pid])
                            delete this.activeProcess[process.pid];
                    // callback(err);
                        reject(new Error(`Error processing results`));
                      
                    }
                });

                process.on('error', (err) =>{
                // callback(err);
                    if (invoked) return;
                    invoked = true;
                    
                    console.log('Child process error',process.pid);
                    if(this.activeProcess[process.pid])
                        delete this.activeProcess[process.pid];
                    reject(new Error(`Child process error`));
                   
                });
            
                // execute the callback once the process has finished running
                process.on('exit',  (code)=> {
                    //callback(err);
                    if (invoked) return;
                    invoked = true;
                    var err = code === 0 ? null : new Error('exit code ' + code);
                    console.log('Child process exit',process.pid);
                    //if(this.activeProcess[process.pid])
                      //  delete this.activeProcess[process.pid];
                
                   
                });
            
            }
            catch (err) {
                console.error('***ERROR GENERATING IMAGE CHILD PROCESS***');
                console.error(err);
                //callback(err);
                reject(new Error(`Error generaging child process`));
               
            }
        });
    

    }

    /*
    async generateImages(scriptPath, params,callback) 
    {
        // keep track of whether callback has been invoked to prevent multiple invocations
        var invoked = false;
        console.log('Prompt params');
        console.log(params);
        var prompt = this.promptFromIndex(params);
        const resultPath=this.proddir+this.galleryImagePath;

        if(!prompt)
        {
            callback(new Error('No prompt'));
            return;
        }

        try 
        {//create order id directory
            var process = childProcess.fork(scriptPath,[params.promptseed,prompt]);
            
            if (!fs.existsSync(resultPath+params.orderid)) {
                fs.mkdirSync(resultPath+params.orderid);
            }
            process.send('Starting child process!');
       
            // listen for errors as they may prevent the exit event from firing
            process.on('message', async function (result) {
                console.log('Downloading images to server: ', result);

                try{
                    const serverurl1=params.orderid+'/'+getNameFromUrl(result.url1);
                    const serverurl2=params.orderid+'/'+getNameFromUrl(result.url2);
                    const serverurl3=params.orderid+'/'+getNameFromUrl(result.url3);
                    const serverurl4=params.orderid+'/'+getNameFromUrl(result.url4);
                    
                    //Save prompt seed and result.imageseed for debug purposes here 
                    //param.promptseed and result.url1 to 4

                    await downloadImage(result.url1,resultPath+serverurl1);
                    await downloadImage(result.url2,resultPath+serverurl2);
                    await downloadImage(result.url3,resultPath+serverurl3);
                    await downloadImage(result.url4,resultPath+serverurl4);

                    callback(false,[serverurl1,serverurl2,serverurl3,serverurl4]);
                    return;
                }
                catch(err)
                {
                    console.error('Error generating images',err);
                    callback(err);
                    return;
                }
            });

            process.on('error', function (err) {
                callback(err);
                if (invoked) return;
                invoked = true;
                console.log('Child process error');
                
                return;
            });
           
            // execute the callback once the process has finished running
            process.on('exit', function (code) {
                callback(err);
                if (invoked) return;
                invoked = true;
                var err = code === 0 ? null : new Error('exit code ' + code);
                console.log('Process exit');
               
                return;
            });
        }
        catch (err) {
            console.error(err);
            callback(err);
            return;
        }
    

    }*/


    countImagesGenerated(orderid)
    {
        const orderGalleryFolder = this.proddir+this.galleryImagePath+orderid+'/';

        var totalImages=0;
        if (fs.existsSync(orderGalleryFolder)) {
             totalImages = fs.readdirSync(orderGalleryFolder).length;
        }

       return totalImages;
    }

    
   
    clearFolder(directoryPath)
    {
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
              console.error('Error reading directory:', err);
              return;
            }
          
            // Iterate through the list of file names and remove each file
            files.forEach((file) => {
              const filePath = path.join(directoryPath, file);
          
              // Check if it's a file (not a subdirectory)
              if (fs.statSync(filePath).isFile()) {
                fs.unlink(filePath, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error(`Error removing file '${filePath}':`, unlinkErr);
                  } else {
                    console.log(`File '${filePath}' removed successfully.`);
                  }
                });
              }
            });
          });
    }
    async restartOrder(req,res)
    {
        
        console.log('Processing order!',req.query.orderid);
        const orderid = req.query.orderid;
        const orderGalleryFolder = this.proddir+this.galleryImagePath+orderid+'/';
        //Remove previous photos here?
        await orderQueries.updateOrderStatus(orderid,'Processing',0);

        try {
            console.log('Clearing: ',orderGalleryFolder);
            if (fs.existsSync(orderGalleryFolder)) {
                //this.clearFolder(orderGalleryFolder);
           
                console.log(`Folder '${orderGalleryFolder}' and its contents removed successfully.`);
            }
            else{
                console.log(`Folder '${orderGalleryFolder}' not found `);
            }

            const orderphotos = await orderQueries.orderCustomerImages({orderid:orderid});
            //console.log(orderphotos);
            var customerimages = JSON.parse(orderphotos.customerimages);

            //customerimages = customerimages.slice(19);
            this.generateOrderGallery({orderid:orderid,imageurllist:customerimages,imagename:orderphotos.ordername});

            res.status(200).json('Order status restarted');


        } catch (error) {
            console.error(`Error restarting order:`, error);
        }

       
    }

  /*  async completeOrder(req,res)
    {
        //Finished this order
        console.log('Finished order!',req.query.orderid);
        const orderid = req.query.orderid;
        let totalGenerated=this.countImagesGenerated(orderid);
        await orderQueries.updateOrderStatus(orderid,'Closed',totalGenerated);
        res.status(200).json('Order status updated to closed');

    }*/

    /*async stopOrder(req,res)
    {
        //Finished this order
        console.log('Resetting order!',req.query.orderid);
        const orderid = req.query.orderid;
        let totalGenerated=this.countImagesGenerated(orderid);
        await orderQueries.updateOrderStatus(orderid,'Ready',totalGenerated);
        res.status(200).json('Order status updated to closed');

    }*/

    async processActiveQueues()
    {
        var index=-1,orderfinished,i=0;
        this.activeOrders.forEach(order => {
            this.processQueue(order.orderid,order.promptQueue);
            
            order.totalGenerated=this.countImagesGenerated(order.orderid);
            console.log('Generated: '+order.totalGenerated);
            console.log('From: '+order.targetGallerySize);
            
            if(order.totalGenerated==order.targetGallerySize)
            {
                index=i;
                orderfinished=order;
            }

            i++;
        });
       if(index>=0)
        {  
            console.log('Update status and total count to DB');
            this.activeOrders.splice(index,1);
            await orderQueries.updateOrderStatus(orderfinished.orderid,'Ready',orderfinished.totalGenerated);
            
        }

        
    }

    async processQueue(orderid,promptQueue)
    {
        if(!promptQueue)
            return;
        

       /* promptQueue.forEach(element => {
            console.log(element.promptseed);
        });*/
        console.log('Active process #: '+Object.keys(this.activeProcess).length)
        if(promptQueue.length>0)
        {    
            console.log("Order id: ",orderid);
            console.log("Queue size: ",promptQueue.length);
            console.log("Active prompts: ",this.activePrompts);
           // this.activePrompts.push(params.promptseed);
            if(this.activePrompts<this.maxActivePrompts)//Max MJ simultaneus jobs
            {
                 
                const gm=this;
                var params = promptQueue.pop();
                gm.activePrompts++;
                
                this.generateImages('./genimages/Midjourney.js',params).then((urls)=>
                {
                    console.log('Prompt finished!!');
                    gm.activePrompts--;

                    let totalGenerated=this.countImagesGenerated(orderid);
                    orderQueries.updateOrderGenerated(orderid,totalGenerated);

                    if (urls && urls.length>0) 
                    {   
                        console.log('Finished generating collage');
                        //urlArray=urlArray.concat(urls);
                    }
                    else{
                        console.error('Error generating collage!!');
                        console.log('Finished: ');
                        console.log(params.promptseed);
                    }
                });

            }
            else{
                console.log('Active works full, waiting for server space...');
            }

        }
    }

    async generateOrderGallery(reqParams)
    {

        try{

            /*** Input parameters ***/
            /*console.log('url list: ',reqParams.imageurllist); 
            console.log('Image url: ',reqParams.imageurl);//Each argument
            console.log('imagename',reqParams.imagename);
            console.log('ingredients',reqParams.ingredients);*/
            
            var order = {orderid:reqParams.orderid,promptQueue:[],targetGallerySize:0,totalGenerated:0};
            

            for(var i=0;i<reqParams.imageurllist.length;i++)
            {
                if(reqParams.imageurllist[i]!=='')
                {
                    //this.enabledPrompts.length;
                   // order.targetGallerySize+=4*this.promptsPerImage;
                    order.targetGallerySize+=4*this.enabledPrompts.length;
                    //4 images per prompt (MJ) X prompts per Image X imagesurl valid uploaded
                   // for(var k=0;k<this.promptsPerImage;k++)
                   this.enabledPrompts.forEach((k) => {
                    
                        //Create new for queue array
                        var params = JSON.parse(JSON.stringify(reqParams));
                       // var params =Object.assign(reqParams);
                        params.imageIndex=i
                        params.promptIndex=k;
                        params.imageurl = params.imageurllist[i];
                        params.promptseed  = Math.floor(Math.random() * 4294967295);
              
                        var promptParams = Object.assign(params);
                        console.log('Adding to queue');
                        console.log(promptParams);
                        
                        order.promptQueue.push(promptParams);

                  
                       
                        
                    });
                    
                }
            }

            this.activeOrders.push(order);
          // await Promise.all(asyncFuncs);
            //urlArray: all generated images
            //seedArray: seeds used for custom images
            //Send email with URL to watch results
        }
        catch (err)
        {
            console.error('Error generating order gallery',err);
        }
    }

    async generateOrder(req,res)
    {
        try
        {
            
            console.log('req params: ');
            console.log(req.body);
            var params = req.body;
            //let data params;
            /*const currentDate = new Date();
            const day = String(currentDate.getDate()).padStart(2, '0');
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const year = String(currentDate.getFullYear());
            const hours = String(currentDate.getHours()).padStart(2, '0');
            const minutes = String(currentDate.getMinutes()).padStart(2, '0');
            const seconds = String(currentDate.getSeconds()).padStart(2, '0');
            let  orderdate= `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;*/
            params.customerimages=params.imageurllist;
            const dbparams={
                ordername:params.imagename,
                components:JSON.stringify(params.ingredients),
                customerimages:JSON.stringify(params.imageurllist),
                orderstatus:'Generating',
                email:params.email,
                totaluploaded:params.imageurllist.length

               // orderdate:orderdate

            }
            console.log('dbparams: ');
            console.log(dbparams);
            params.orderid = await orderQueries.registerOrder(dbparams)
            console.log('Order id: ',params.orderid);

            //Send email confirming order id
            mailer.sendOrderEmail(params.email,params.orderid,params.imagename);

            this.generateOrderGallery(params);
            console.log('Result: ');
            const result={orderid:params.orderid};

          

            console.log(JSON.stringify(result));
            res.status(200).json(result);
        }
        catch(err)
        {
            console.error('Error generating url result',err);
            return res.status(500).send(err);
        }
      
    }
}

module.exports = GalleryManager;