const puppeteer = require('puppeteer');
//const puppeteer = require('puppeteer-extra')
const currentDir = process.cwd();
const fs = require('fs');


const pageName = '$YOUR_WEB_PAGE';
const baseUrl=`$YOUR_WEB_MAIN_URL`;

const imagesPerPage=30;
//Start page index
var numPage=0;
const  totalPages=4; 
//const pageName='columbus-burgers-san-francisco';

const baseDownload=`webdownloads\\`;

async function launchBrowser()
{
      //Browser
    //const timestamp = Date.now();
    var browser,screenshotspath;
    //puppeteer.use(pluginStealth());

    if (currentDir.includes('C:\\')) {
       // screenshotspath = `screenshots\\screenshot.png`;
        browser = await puppeteer.launch(
            {executablePath: `$YOUR_LOCAL_CHROME_PATH\\chrome\\win64-116.0.5845.96\\chrome-win64\\chrome.exe`,
                headless: true,
                args: ['--no-sandbox'],
            });
    }
    else{
       // screenshotspath = `/home/aijuice/front/public_html/images/screenshots/screenshot.png`;
        browser = await puppeteer.launch(
            {executablePath: `/usr/bin/chromium-browser`,
                headless: true,
                args: ['--no-sandbox'],
            });
    }

    return browser;
}


async function loadPage(page,url)
{
    await page.goto(url);


    await page.evaluate(async () => {
        try{
            console.log('Evaluate!');

            window.scrollBy(0, 500);//Half page to load all images
        }
        catch(err)
        {
            console.log('error scrolling');
        }

      });
}

(async () => {


    
    
    let counter = 0;

    //const userAgent = randomUseragent.getRandom();
    var browser = await launchBrowser();

    const page = await browser.newPage();
    var screenshotspath = `screenshots\\`;
    page.on('response', async (response) => {

       
        // const matches = /.*\.(jpg|png|svg|gif)$/.exec(response.url());
        try{
            const matches = /.*\.(jpg)$/.exec(response.url());
            console.log(matches);
            if (matches && (matches.length === 2)) {
                
               // console.log('Image; ',counter);
                //console.log(matches);
                const extension = matches[1];
                const buffer = await response.buffer();
                console.log('Bytes: ',buffer.length);
                const imagepath=baseDownload+pageName+`\\image-${counter}.${extension}`;
                if(buffer.length>1500){//filter thumbnails and small images
                    fs.writeFileSync(imagepath, buffer, 'base64')
                
                    //const dimensions = sizeOf(imagePath);
                   // console.log('Dims: ',dimensions.width,'-',dimensions.height);
                    counter += 1;
                }
              
            }
        }catch(err)
        {
            console.log('Error processing image');
        }
        
    });

    await page.setDefaultNavigationTimeout(0);
    await page.setViewport({
        width: 1200,
        height: 800
    });

    //Load first page
    if (!fs.existsSync(baseDownload+pageName)) {
        fs.mkdirSync(baseDownload+pageName);
    }

    await loadPage(page,baseUrl+numPage*imagesPerPage);
    numPage++;
    const  interval=setInterval(()=>{

       
        if(numPage<totalPages)
        {
            loadPage(page,baseUrl+numPage*imagesPerPage);
            console.log('num page',numPage);
            numPage++;
          
        }
        else
        {
           
            clearInterval(interval);
            setTimeout(()=>{
                browser.close();
            },5000);
            
         
            
        }
    },5000);
   
})();