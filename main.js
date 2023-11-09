//Initialize express
const app =require('./classes/modules/ExpressServer.js');

//Singleton manager class
const GalleryManager = require('./classes/controllers/GalleryManager.js');
const DesignManager = require('./classes/controllers/DesignManager.js');
const CartManager = require('./classes/controllers/CartManager.js');
const OrderQueries = require('./classes/controllers/OrderQueries.js');
let orderQueries = new OrderQueries();

let gm = new GalleryManager();
let dm = new DesignManager();
let cm = new CartManager();



setInterval(gm.processActiveQueues.bind(gm),5000);
//Endpoints and routes

app.post("/upload", (req, res) => {
  // Process the uploaded image here
    gm.uploadCustomerPhoto(req,res);
    
});

app.post("/uploadResult", (req, res) => {
  // Process the uploaded image here

    console.log('Uploading photoshot result');
   
    dm.uploadDesignerPhoto(req,res)
    
});

app.post("/generate", async (req, res) => {

    console.log("Generating order...");
   // console.log("request: ",req.body);
   
   
   gm.generateOrder(req,res);
    
});


app.get("/getorders", async (req, res) => {

  console.log("Getting orders...");
 // console.log("request: ",req.body);
  dm.getOrders(req,res);
  
});

app.get("/downloadOrder", async (req, res) => {

  console.log("Downloading order...");
 // console.log("request: ",req.body);

  dm.downloadOrder(req,res);
  
});


/*
app.get("/stopOrder", async (req, res) => {

  console.log("Stop order...");
 // console.log("request: ",req.body);
  gm.stopOrder(req,res);
  
});*/


app.get("/completeOrder", async (req, res) => {

  console.log("Completing order...");
 // console.log("request: ",req.body);
 // gm.completeOrder(req,res);
  const orderid = req.query.orderid;
  let totalGenerated=gm.countImagesGenerated(orderid);
  await orderQueries.updateOrderStatus(orderid,'Cleared',totalGenerated);
 
  const totalSubmitted=dm.countImagesSubmitted(orderid);
  await orderQueries.updateOrderStatusSubmitted(orderid,'Cleared',totalSubmitted);

  res.status(200).json('Order status updated to closed');
  
});


app.post("/submitPhotoshot", async (req, res) => {

  console.log("Submiting order...");
 // console.log("request: ",req.body);
  
  dm.submitPhotos(req,res);

 //Save final list in DB
 //Send email to customer


  
});

app.get("/submitGalleryPhotos", async (req, res) => {

  console.log("Submiting order...");
  dm.submitGalleryPhotos(req,res);

  
});



app.get('/orders', (req, res) => {
  res.redirect('/orders.html');

});



app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Perform authentication logic here
  // For simplicity, we'll assume the username is "admin" and the password is "password"

  if (username === 'software' && password === 'aijuice2023.') {
    req.session.authenticated = true;
    res.redirect('/orders.html');
  } else {
    res.redirect('/login.html');
  }
});

app.get('/logout', (req, res) => {
  // Clear the session
      req.session.destroy((err) => {
          if (err) {
          console.error('Error clearing session:', err);
          res.status(500).send('Error clearing session');
          } else {
          res.send('Session cleared.');
          }
      });
  });
  


  app.get("/watermarkPhotoList", async (req, res) => {

    console.log("Watermark  list");
   
 
    dm.watermarkList(req,res);


  });


  app.get('/addCartItem', (req, res) => {
      
    console.log('Add cart item');
    cm.addCartItem(req,res);
  
  });
  
  app.get('/clearCart', (req, res) => {
      
    console.log('Clear cart');
    cm.clearCart(req,res);
  
  });
  
  app.get('/getCart', (req, res) => {
      
    console.log('get cart');
    cm.getCart(req,res);
  
  });
  

  app.post('/create-checkout-session', async (req, res) => {
    cm.checkoutCart(req,res);

  });
  
  app.get('/successPayment',async(req,res)=>{
    
    cm.successPayment(req,res);

  });

  app.get('/validPayment',async(req,res)=>{
    
  // req.session.sessionid='cs_test_a1WgqHzLiLiHHk5k9qC7faGO5n6O6fbZtV2FXHyHQlpgxyylfaWRPIGlXH';
   dm.validPayment(req,res);

  });


  app.get("/restartOrder", async (req, res) => {

    console.log("Restarting order...");
  // console.log("request: ",req.body);
    gm.restartOrder(req,res);
  });



  
