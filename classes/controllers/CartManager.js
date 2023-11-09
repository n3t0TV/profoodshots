const projectDir = process.cwd();
var AdmZip = require("adm-zip");
const path = require('path');
const OrderQueries = require(projectDir+'/classes/controllers/OrderQueries.js');
const CartSession = require('./CartSession.js');
let orderQueries = new OrderQueries();
const StripeAPI = require(projectDir+'/classes/apis/StripeAPI.js');
let stripeApi= new StripeAPI();
stripeApi.initAPI();
const Mailer = require(projectDir+'/classes/apis/Mailer.js');
let mailer = new Mailer();

class CartManager
{
    constructor()
    {
        this.carts={};
        this.unitPrice=20;//Photo price
    }
    async addCartItem(req,res){

        try{

            console.log('Session id: ',req.session.id);
            console.log('Order id: ',req.query.orderid);
            console.log('Imageurl: ',req.query.imageurl);

            
            //Retrieve email from order 
            const sessionid = req.session.id;
            const orderid = req.query.orderid;
          
           
            const imageurl = req.query.imageurl;
            const imageid= path.basename(imageurl);//Name
           
        
            if(sessionid)//Order id registered with an email
            {
                if(!this.carts[sessionid])
                {
                    //const email = await orderQueries.emailFromOrder({orderid:orderid});
                    this.carts[sessionid]=new CartSession();
                    this.carts[sessionid].initializeNewCart('',orderid,[]);
                    this.carts[sessionid].addItem(imageid,this.unitPrice,1,'',imageurl);
                }
                else
                {
                    this.carts[sessionid].addItem(imageid,this.unitPrice,1,'',imageurl);
                 
                    //req.session[userid]=cart;
                }
             
                console.log('Cart: ',this.carts[sessionid]);
                console.log('Items: ',this.carts[sessionid].totalAmount());
                console.log('Total: ',this.carts[sessionid].totalItems());
                console.log('Email: ',this.carts[sessionid].email);
                res.status(200).json({totalItems:this.carts[sessionid].totalItems(),totalAmount:this.carts[sessionid].totalAmount(),email:this.carts[sessionid].email});  
            }
            else{
                console.log('Session id not defined!');
                res.status(500).send("Session id not defined or invalid parameter");
            }
        }
        catch(err)
        {
            console.log('Unable to add item',err);
            res.status(500).send("Couldnt clear cart");
        }
    }

    async clearCart(req,res)
    {

        try{
            const sessionid = req.session.id;
            const orderid= req.query.orderid;
            //const email = await orderQueries.emailFromOrder({orderid:orderid});
            //console.log('Order id: ',orderid);
            //console.log('User email: ',email);
            if(sessionid )
            {

                //const email = await orderQueries.emailFromOrder({orderid:orderid});
                //console.log('User email: ',email);//User email
                if(this.carts[sessionid])
                {
                 //Clear order cart
                    this.carts[sessionid].clearCart();      
                }
                else{
                    
                    this.carts[sessionid]=new CartSession();
                    this.carts[sessionid].initializeNewCart('',orderid,[]);
                }
                res.status(200).json({totalItems:this.carts[sessionid].totalItems(),totalAmount:this.carts[sessionid].totalAmount()});
            }
            else{
                console.log('Unable to clear cartd!',err);
                res.status(500).send("Couldn't clear cart");
            }
            
        }
        catch(err)
        {
            console.log('Unable to clear cartd!',err);
            res.status(500).send("Couldn't clear cart");
        }
    }

    async getCart(req,res)
    {

        try{

            const sessionid = req.session.id;
            const orderid= req.query.orderid;
            const orderdetails = await orderQueries.orderDetails({orderid:orderid});       
           // console.log('Order name ',orderdetails.ordername);
            //const email =orderdetails.email;
            const ordername =  orderdetails.ordername;
           //const email = await orderQueries.emailFromOrder({orderid:orderid});
            //console.log('Order id: ',orderid);
            //console.log('User email: ',email);
            if(sessionid)
            {
                if(!this.carts[sessionid])
                {
                    this.carts[sessionid]=new CartSession();
                    this.carts[sessionid].initializeNewCart('',orderid,[]);
                }
                res.status(200).json({totalItems:this.carts[sessionid].totalItems(),totalAmount:this.carts[sessionid].totalAmount(),ordername:ordername});
            }
            else{
                console.log('Unable to get cartd!',err);
                res.status(500).send("Couldn't clear cart");
            }
            
        }
        catch(err)
        {
            console.log('Unable to clear cartd!',err);
            res.status(500).send("Couldn't clear cart");
        }
    }

    async checkoutCart(req,res)
    {
        try{
            console.log('Checkout cart request');
           // console.log(req);
            const sessionid = req.session.id;
            const orderid= req.body.orderid;
            if(sessionid)
            {
                console.log('Checkout cart...');
                //Clear any previous purchase from same session
                req.session.paysessionid=undefined;
                stripeApi.processPayment(req,res,this.unitPrice*this.carts[sessionid].totalItems(),orderid);
            }
            else{
                throw new Error('No order id defined!');
            }
            
        }
        catch(err)
        {
            console.log('Unable to process payment',err);
            res.status(500).send("Couldn't checkout cart");   
        }
        
    }

    async successPayment(req,res)
    {
        let customername,customeremail;
        
        const sessionid = req.session.id;

        try{

            let session = await  stripeApi.getPaymentSession(req);
            const orderid = req.query.orderid;
            let data = {};

            data.sessionid = session.id;
            data.orderid=orderid;
            data.customername = session.customer_details.name;
            data.customeremail = session.customer_details.email;
            data.amount = session.amount_total;

            const cartimageslist = this.carts[sessionid].list.map(item => item.imageurl);     
            data.cartimages = JSON.stringify(cartimageslist);
            console.log(data.cartimages);

            console.log(session.customer_details);

            console.log('Registering payment!!');
            //console.log('Order id ',data.orderid);
            console.log('Stripe session id ',data.sessionid);
            console.log('Customer name',data.customername);
            console.log('Customer email',data.customeremail);

            if(data.sessionid)
            {
                //default values
             
                //Register in DB
                console.log('Registering checkout in DB');                
                req.session.paysessionid=data.sessionid;//Payment session id
                orderQueries.registerPayment(data);

                const protocol = req.protocol;
                const host = req.get('host');
        
                var hostname= `${protocol}://${host}`
                console.log(hostname);
                //Email used when registering order
                //const orderdetails = await orderQueries.orderDetails({orderid:orderid});       
                //console.log('Order name ',orderdetails.ordername);
                //const email =orderdetails.email;
               // const ordername =  orderdetails.ordername;


               // const email = await orderQueries.emailFromOrder({orderid:data.orderid});
                const downloadLink = hostname+'/successPayment.html?sessionid='+data.sessionid;

                //Notify to who created the order
                /*mailer.sendDownloadEmail(email,downloadLink,data.customername,data.sessionid);
                if(customeremail!==email)//Customer email when register payment is different
                {*/
                    //Notify customer who paid the order
                if(data.customeremail)
                {
                    mailer.sendDownloadEmail(data.customeremail,downloadLink,data.customername,data.sessionid);
                }
                else{
                    console.log('No customer email!!');
                }
            }
            else{
                throw new Error('Unable to register in DB');
            }
            res.redirect('/successPayment.html');
        }
        catch(err)
        {
            console.log('Unable to process payment',err);
            res.redirect('/cancelPayment.html');
           
        }
        //Register payment in database (with cart items)
       
    }

    
   

    


}

module.exports = CartManager;
