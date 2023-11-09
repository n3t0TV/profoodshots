
console.log('Generating images...');

import { Midjourney } from "midjourney";

import configJson from './config/discordapi.json' assert {type: 'json'};

//const configJson = JSON.parse(JSON.stringify(discordapi));

console.log(JSON.stringify(configJson));
const projectDir = process.cwd();
console.log(projectDir);

console.log(process.argv);
const argsarr= process.argv.slice(2);
const imageseed = argsarr[0];//Unique image id 
const prompt = argsarr[1];
console.log('prompt: ',prompt);//Each argument

var client;
var upscaleclient;

//parent process message initialization
process.on('message', async message => 
{
    console.log('Received message from parent ',message);

    try
    {  
    
       /*const ranNum = Math.floor(Math.random() * 12) + 1;
       var channel;
       if(ranNum%2==0)
        channel = configJson.ordergen1;
       else
        channel = configJson.ordergen2;*/

        client = new Midjourney({
          ServerId: configJson.ServerId,
          ChannelId: configJson.ordergen1,
          SalaiToken: configJson.SalaiToken,
          Debug: false,
          Ws: true,
          });

        await client.Connect();
        console.log('Discord client connected!');
        const Imagine = await client.Imagine(
          prompt,
          (uri, progress) => {
            //console.log("Imagine", uri, "progress", progress);
          }
        );

        if (!Imagine) {
          console.error('***Error proceeding to upsacles***');
          process.send("");
          return;
        }
        //console.log({ Imagine });
        // Upscale U1
        

         

        const U1CustomID = Imagine.options?.find((o) => o.label === "U1")?.custom;
        const U2CustomID = Imagine.options?.find((o) => o.label === "U2")?.custom;
        const U3CustomID = Imagine.options?.find((o) => o.label === "U3")?.custom;
        const U4CustomID = Imagine.options?.find((o) => o.label === "U4")?.custom;
    
        client.Close();
        console.log('Upscaling...');
        upscaleclient = new Midjourney({
          ServerId: configJson.ServerId,
          ChannelId: configJson.ordergen1,
          SalaiToken: configJson.SalaiToken,
          Debug: false,
          Ws: true,
          });

        const Upscale1 = await upscaleclient.Custom({
          msgId: Imagine.id,
          flags: Imagine.flags,
          customId: U1CustomID,
          loading: (uri, progress) => {
            //console.log("Loading", uri, "progress", progress);
          },
        });
        const Upscale2 = await upscaleclient.Custom({
          msgId: Imagine.id,
          flags: Imagine.flags,
          customId: U2CustomID,
          loading: (uri, progress) => {
            //console.log("Loading", uri, "progress", progress);
          },
        });

        const Upscale3 = await upscaleclient.Custom({
          msgId: Imagine.id,
          flags: Imagine.flags,
          customId: U3CustomID,
          loading: (uri, progress) => {
           // console.log("Loading", uri, "progress", progress);
          },
        });
        const Upscale4 = await upscaleclient.Custom({
          msgId: Imagine.id,
          flags: Imagine.flags,
          customId: U4CustomID,
          loading: (uri, progress) => {
            //console.log("Loading", uri, "progress", progress);
          },
        });

        upscaleclient.Close();
        //console.log({Upscale});
        process.send({imageseed:imageseed,collage:Imagine.uri,url1:Upscale1.uri,url2:Upscale2.uri,url3:Upscale3.uri,url4:Upscale4.uri});
        process.exit(0);
    }
    catch(err)
    {
        process.send("");
        console.error('Error child process images!!');
        console.log(err);
        //throw err;//Gallery keeping track of active processes
    }

});

