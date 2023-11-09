const fs = require('fs');
const Stripe = require('stripe');
const projectDir = process.cwd();
class StripeAPI
{
    constructor()
    {
        console.log();
    }

    initAPI() {
        const projectDir = process.cwd();
        console.log(projectDir);
        const data =fs.readFileSync(projectDir + '/config/stripeapi.json', 'utf8')
           
        let configJson = JSON.parse(data);

       if(projectDir.includes('/mnt/c') || projectDir.includes('dev'))
            this.apiKey = configJson.API_KEY;
       else
            this.apiKey = configJson.PROD_KEY;
        
        this.stripe = Stripe(this.apiKey);


        //console.log('Stripe key: ',this.apiKey);
    }

    async processPayment(req,res,unitPrice,orderid)
    {
        //var host =req.get('protocol')+req.get('host');
        const protocol = req.protocol;
        const host = req.get('host');

        var hostname= `${protocol}://${host}`
        console.log(hostname);

        console.log('Processing stripe payment');
        const session = await this.stripe.checkout.sessions.create({
            line_items: [
            {
                price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Photoshot',
                },
                unit_amount:unitPrice*100,
                },
                quantity: 1,
            },
            ],
            mode: 'payment',
            success_url: hostname+'/successPayment?session_id={CHECKOUT_SESSION_ID}&orderid='+orderid,
            cancel_url: hostname+'/cancelPayment.html',
        });

        res.redirect(303, session.url);
    }

    async getPaymentSession(req)
    {
        if(req.query.session_id)
        {
            console.log('Payment session data: ');
            console.log(req.query);
            console.log(req.query.session_id);
            const session = await this.stripe.checkout.sessions.retrieve(req.query.session_id);
           
            //const customer = await this.stripe.customers.retrieve(session.customer);
            return session;
        }
        
        return [undefined,undefined,undefined];

        
    }

   
}


module.exports = StripeAPI;
