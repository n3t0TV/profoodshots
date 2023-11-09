//Process orders
const projectDir = process.cwd();
const path = require('path');
const OrderQueries = require(projectDir+'/classes/controllers/OrderQueries.js');
const fs = require('fs');
const {v4:uuid} = require('uuid'); // I chose v4 ‒ you can select others
let orderQueries = new OrderQueries();
var AdmZip = require("adm-zip");
var watermark = require('jimp-watermark');
const crypto = require('crypto-js');
const { SmsInbound } = require('mailersend');
const imagepaths = require(projectDir+'/classes/controllers/ImagePaths.js');
const Mailer = require(projectDir+'/classes/apis/Mailer.js');
let mailer = new Mailer();
//mailer.initAPI();

class DesignManager
{
    constructor()
    {
        this.uploadImagePath= imagepaths.uploadImagePath; //Include Customer uploaded in zip
        this.galleryImagePath = imagepaths.galleryImagePath; //AI MJ Generated in zip
        this.downloadPath = imagepaths.downloadPath;
        this.resultImagePath = imagepaths.resultImagePath;
        this.sharedImagePath = imagepaths.sharedImagePath;
        this.imagehost = imagepaths.prodhost;
        this.proddir = imagepaths.proddir;

        /*this.uploadImagePath="/front/public_html/images/tmp/";//Include Customer uploaded in zip
        this.galleryImagePath="/front/public_html/images/gallery/";//AI MJ Generated in zip
        this.downloadPath="/front/public_html/download/";//Zip files
        this.resultImagePath="/front/public_html/images/results/";//Designer uploads for cart*/
    }
    //Counts images submitted by desginer (watermarked)
    countImagesSubmitted(orderid)
    {

        const orderGalleryFolder = this.proddir+this.resultImagePath+orderid+'/';
        var totalImages=0;

        try{
            const files = fs.readdirSync(orderGalleryFolder);

            console.log('Files: ');
            console.log(files);
            files.forEach((file) => {
                const filePath = path.join(orderGalleryFolder, file);
                const stats = fs.lstatSync(filePath);
                console.log(stats.isSymbolicLink());
                if (!stats.isSymbolicLink()) {
                    totalImages++;
                }
             
            });
            return totalImages;

        }
        catch(err)
        {
            console.log('Error counting folder',totalImages);
            return totalImages;

        }
      
       
    }

    //Generates a zip contianing customer original uploads and AI generated ones
    async downloadOrder(req,res)
    {
        try
        {
            //Force ready state
           
            var zip = new AdmZip();
            const orderid = req.query.orderid;
           
            //let totalGenerated=gm.countImagesGenerated(orderid);   
            //await orderQueries.updateOrderStatus(orderid,'Ready',totalGenerated);
          

            let uploadedimages=await orderQueries.uploadsFromOrder({orderid:orderid});
            console.log('Uploaded images: ')
            console.log(uploadedimages);
           

            const orderGalleryFolder = this.proddir+this.galleryImagePath+orderid+'/';
            

            //Uploaded images
            /*uploadedimages.forEach(elem => {

                const filepath=this.proddir+this.uploadImagePath+path.basename(elem);
                console.log(filepath);
                zip.addLocalFile(filepath);
            });*/

            //Generated images
            zip.addLocalFolder(orderGalleryFolder);
           /* fs.readdirSync(orderGalleryFolder).forEach(file => {
                zip.addLocalFile(orderGalleryFolder+'/'+file);
                console.log('Adding file: ',file);
            });*/

            const currentTimestampInSeconds = Math.floor(new Date().getTime() / 1000);
            console.log('Writing zip..');
            zip.writeZip(this.proddir+this.downloadPath+orderid+'.zip');

            console.log('Downloading zip...');

            
            // zip archive of your folder is ready to download
         
            res.download(this.proddir+this.downloadPath+orderid+'.zip',orderid+'.zip',function(err){
                if(err)
                {
                    console.log(err);
                }
            });
          
            
        }
        catch(err)
        {
            console.log('Error generating zip for order id');
            console.error(err);
            return res.status(500).send(err);

        }
        
    }


    async getOrders(req,res)
    {
        //Check if req has status to filter results HERE
       
        console.log('Retrieving all orders...');
        const result = await orderQueries.getAllOrders();
        //onsole.log('Response: ',JSON.stringify(result));
        res.status(200).json(result);
        
       
    }

    //Generates hash associated with orderid to place non watermarked images publicly but hidden from orderid
    hashfromOrderId(orderid)
    {
        const orderidStr = orderid.toString(); 
        

        const hashKey = crypto.SHA256('aijuice'+orderidStr).toString(crypto.enc.Hex).substring(0,6);
        //hash.update(orderidStr);
       // const hashKey = hash.digest('hex');
        console.log('hashkey');
        console.log(hashKey);

        return hashKey;
    }

    //Generates a symlink and watermarks images submitted by designer
    async submitPhotos(req,res)
    {

        try
        {
                
            const orderid = req.body.orderid;
            const resultOrderPath = this.proddir +  this.resultImagePath + orderid + '/';

            if (!fs.existsSync(resultOrderPath)) {
                fs.mkdirSync(resultOrderPath);
            }
        
            const hash = this.hashfromOrderId(orderid);
            //await orderQueries.updateOrderStatus(orderid,'Closed');

            const shareHashPath=this.proddir+this.sharedImagePath+hash+'/';

            if (!fs.existsSync(shareHashPath)) {
                fs.mkdirSync(shareHashPath);
            }

            
                
            fs.symlink(shareHashPath, resultOrderPath+hash, 'dir', (err) => {
                if (err) {
                    console.error('Unable to create symlink');
                } else {
                    console.log('Symlink to folder created successfully.');
                }
            });

            console.log('Submiting: ',req.body.imageurllist.length,' photos');
            for(var i=0;i<req.body.imageurllist.length;i++)
            {
                const serverfilename = path.basename(req.body.imageurllist[i]);
                //const directorypath = resultOrderPath+serverfilename;

                const sourceFilePath = this.proddir + this.uploadImagePath + serverfilename;
                // Define the destination path where you want to save the file             
                try
                {

                    fs.copyFileSync(sourceFilePath,shareHashPath+serverfilename);

                    const wmname=serverfilename;
                    var options = {
                        'ratio': 1.0,
                        'opacity':0.4,
                        'dstPath' :this.proddir +  this.resultImagePath + orderid + '/'+wmname
                    };
                    
                    await watermark.addWatermark(sourceFilePath, this.proddir+'/front/public_html/assets/img/watermark-white.png',options).then(data => {
                            console.log(data);
                    });
                    
                }catch(err)
                {
                    console.log('Error copying file',err);
                }
                        //Apply watermark here
                    
                //});

            }

            
            //const email = await orderQueries.emailFromOrder({orderid:orderid})
            
            const orderdetails = await orderQueries.orderDetails({orderid:orderid});
            const email = orderdetails.email;
            const ordername = orderdetails.ordername;
            console.log('Order name: ',ordername);

            const protocol = req.protocol;
            const host = req.get('host');
    
            var hostname= `${protocol}://${host}`
            console.log(hostname);
            mailer.sendGalleryEmail(email,hostname+'/shopgallery.html?orderid='+orderid,orderid,ordername);

            const totalSubmitted=this.countImagesSubmitted(orderid);
            await orderQueries.updateOrderStatusSubmitted(orderid,'Closed',totalSubmitted);

            return res.send({ status: "success"});
        // await setTimeout(()=>{ },1000);

       
           
        }
        catch(err)
        {
            console.log('Some error ocurred',err);
            return res.status(500).send(err);
        }
           
    }

    async submitGalleryPhotos(req,res)
    {

        try
        {
            //this.proddir = '/mnt/c/Developer/aijuice'
            const orderid = req.query.orderid;
            const resultOrderPath = this.proddir +  this.resultImagePath + orderid + '/';
            const galleryOrderPath = this.proddir+this.galleryImagePath + orderid+'/';
            if (!fs.existsSync(resultOrderPath)) {
                fs.mkdirSync(resultOrderPath);
            }
        
            const hash = this.hashfromOrderId(orderid);
            //await orderQueries.updateOrderStatus(orderid,'Closed');

            const shareHashPath=this.proddir+this.sharedImagePath+hash+'/';

            if (!fs.existsSync(shareHashPath)) {
                fs.mkdirSync(shareHashPath);
            }

            
                
            fs.symlink(shareHashPath, resultOrderPath+hash, 'dir', (err) => {
                if (err) {
                    console.error('Unable to create symlink');
                } else {
                    console.log('Symlink to folder created successfully.');
                }
            });

            const files = fs.readdirSync(galleryOrderPath);

            for(var i=0;i<files.length;i++){
                const sourceFilePath = path.join(galleryOrderPath, files[i]);
                try
                {
                    const serverfilename = path.basename(sourceFilePath);
                    fs.copyFileSync(sourceFilePath,shareHashPath+serverfilename);

                    const wmname=serverfilename;
                    var options = {
                        'ratio': 1.0,
                        'opacity':0.4,
                        'dstPath' :this.proddir +  this.resultImagePath + orderid + '/'+wmname
                    };
                    
                    await watermark.addWatermark(sourceFilePath, this.proddir+'/front/public_html/assets/img/watermark-white.png',options).then(data => {
                            console.log(data);
                    });
                }
                catch(err)
                {
                    console.log('Error copying file',err);
                }

            }

            //const email = await orderQueries.emailFromOrder({orderid:orderid})
            
            const orderdetails = await orderQueries.orderDetails({orderid:orderid});
            const email = orderdetails.email;
            const ordername = orderdetails.ordername;
            console.log('Order name: ',ordername);

            const protocol = req.protocol;
            const host = req.get('host');
    
            var hostname= `${protocol}://${host}`
            console.log(hostname);
            mailer.sendGalleryEmail(email,hostname+'/shopgallery.html?orderid='+orderid,orderid,ordername);

            const totalSubmitted=this.countImagesSubmitted(orderid);
            await orderQueries.updateOrderStatusSubmitted(orderid,'Closed',totalSubmitted);

            return res.send({ status: "success"});
        // await setTimeout(()=>{ },1000);

       
           
        }
        catch(err)
        {
            console.log('Some error ocurred',err);
            return res.status(500).send(err);
        }
           
    }
    

    
    //Uploads submitted results to tmp folder
    uploadDesignerPhoto(req,res)
    {
        console.log('Upload image to server...');
       
        const orderid = req.body.orderid;

        console.log(orderid);
        if (!req.files) {
            return res.status(400).send("No files were uploaded.");
        }

        

        console.log(req.files);
        const file = req.files.image;
        const fileextension =file.name.split('.').pop();
        const randname=uuid();
        var serverfilename = randname+'.'+fileextension; //file.name is the local file name
        console.log('Server filename: ',serverfilename);


        const directorypath = this.proddir +  this.uploadImagePath + serverfilename;
   
        // Define the destination path where you want to save the file
        console.log(serverfilename);
        file.mv(directorypath, (err) => {
            if (err) {
            console.log('Error moving file, check folder permissions!')
            console.error(err);
             return res.status(500).send(err);
            }
            return res.send({ status: "success", imagehost:this.imagehost,imagepath: "images/tmp/"+serverfilename });
        });

    }
    //Lists images in the results folder that are waterarked
    watermarkList(req,res)
    {
        let photoList = [];
        const orderid = req.query.orderid;
        const orderPath = this.proddir+this.resultImagePath + orderid;


        try{
        
            
            fs.readdir(orderPath, (err, files) => {
                if (err) {
                    console.error('Error:', err);
                    return;
                }

                const pngFiles = files.filter((file) => {
                    return (path.extname(file).toLowerCase() === '.png' || path.extname(file).toLowerCase()==='.jpg');
                });
                pngFiles.forEach((file) => {
                    //const filePath = path.join(orderPath, file);
                    //let hostname = 'https://'+process.env.HOSTNAME+'/';
                    photoList.push(this.imagehost+'images/results/'+orderid+'/'+file);
                    
                });
                return res.send({ status: "success", imagelist:photoList});

            });
        }
        catch(err)
        {
            console.log('Error retrieving list ',err);
            return res.status(500).send(err);
        }
    }

    getSymLinkName(folderPath)
    {
        try{
            const files = fs.readdirSync(folderPath);
            var symlink;
        
            console.log('Files: ');
            console.log(files);
            files.forEach((file) => {
                const filePath = path.join(folderPath, file);
                const stats = fs.lstatSync(filePath);
                console.log(stats.isSymbolicLink());
                if (stats.isSymbolicLink()) {
                    symlink=file;
                    return;
                }
             
            });

            return symlink;

        

            
        }
        catch(err)
        {
            console.log('Unable to read link');
            return;
        }
       

   
    }
    


    async validPayment(req,res)
    {
        var sessionid;
        try
        {
            //Force ready state
            if(req.query.sessionid)
            {
                sessionid=req.query.sessionid;
            }
            else
            {
                if(req.session.paysessionid)
                {
                    sessionid=req.session.paysessionid;
                }
            }

            if(!sessionid)
            {
                throw new Error('Invalid payment session id');
            }
          
            let data=await orderQueries.photosFromSession({sessionid:sessionid});

            if(!data)
            {
                throw new Error('Session id not registered in DB');
            }

            console.log('Purchased images: ')
            console.log(data.cartimages);    
        
            var zip = new AdmZip();
            //Uploaded images
            data.cartimages.forEach(elem => {

                //elem.substring(startIndex);
                const pattern = /\/results\/(\d+)\//;
                // Use the pattern to search for matches in the URL
                const matches = elem.match(pattern);
                var photoorderid;
                // Check if a match was found
                if (matches && matches.length > 1) {
                    // The order ID is captured in the first capturing group (index 1)
                    photoorderid = matches[1];
                    //console.log(orderId); // Output: 7644211
                    const orderPath = this.proddir+this.resultImagePath + photoorderid;
                    const sharedPath = this.getSymLinkName(orderPath);
                    
                    if(sharedPath)
                    {
                        
                        const sharedGalleryFolder = orderPath+'/'+sharedPath+'/';
                        const filepath=sharedGalleryFolder+path.basename(elem);
                       // console.log(filepath);
                        zip.addLocalFile(filepath);
                    }
                } 
 
                
            });

            //const currentTimestampInSeconds = Math.floor(new Date().getTime() / 1000);
            console.log('Writing zip..');
            zip.writeZip(this.proddir+this.downloadPath+sessionid+'.zip');

            console.log('Downloading zip...');
            // zip archive of your folder is ready to download
        
            res.download(this.proddir+this.downloadPath+sessionid+'.zip',sessionid+'.zip',function(err){
                if(err)
                {
                    console.log(err);
                }
            });
            
            
        }
        catch(err)
        {
            console.log('Error generating zip for order id');
            console.error(err);
            return res.status(500).send(err);

        }


       
      
    }



 
    
}


module.exports = DesignManager;