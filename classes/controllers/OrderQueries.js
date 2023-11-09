const projectDir = process.cwd();


const {connect} = require(projectDir+'/db/mysqlConnection');
const { jsonrepair } = require('jsonrepair');
const mysql = require('mysql2');
console.log('Connecting DB');
let dbcon = connect();

class OrderQueries{

    constructor()
    {
        this.connection = dbcon;
    }

    async registerOrder(data) {

        let connection = this.connection;
        console.log("-----registerOrder-----");
        var orderid;
        if (data !== undefined && data !== null) {
            //6 digits
            orderid  = Math.floor(Math.random() * 9998999)+1000;
            console.log("formatedData: ", data);
            console.log('id',orderid);
            let queryString = `INSERT INTO photoorder (id, ordername, components, customerimages, orderstatus,email,totaluploaded) VALUES (?,?,?,?,?,?,?)`;

            queryString = mysql.format(queryString, [orderid,data.ordername,data.components,data.customerimages,data.orderstatus,data.email,data.totaluploaded]);
            console.log(queryString);
            await connection.asyncQuery(queryString);
            
           
        }
        //connection.end();

        return orderid;
    }

    async getAllOrders()
    {
        let connection = this.connection;
        let queryString = `SELECT id,email,  DATE_FORMAT(orderdate,'%d-%b-%Y %H:%i') as orderdate,ordername,orderstatus,customerimages,totalgenerated,totaluploaded,totalsubmitted FROM photoorder WHERE orderstatus!='Cleared' ORDER BY orderdate desc `;
        console.log(queryString);
        let result = await connection.asyncQuery(queryString);
       // console.log('query result: ',queryResult);
        result = Object.values(JSON.parse(JSON.stringify(result)));

        //connection.end();
        //console.log('result: ',result)
       // console.log(result);
        return result;
    }

    async uploadsFromOrder(data)
    {
        let connection = this.connection;
        let queryString = `SELECT customerimages FROM photoorder WHERE id=${data.orderid}`;
        var uploads=[];

        console.log(queryString);
        let result = await connection.asyncQuery(queryString);
       // console.log('query result: ',queryResult);
        result =  Object.values(JSON.parse(JSON.stringify(result)));
        if(result.length>0)
            uploads=JSON.parse(result[0].customerimages);


        //connection.end();
        //console.log('result: ',result)
       // console.log(result);
        return uploads;
    }

    /*async getOrdersByStatus(status)
    {
        let connection =connect();
        console.log("-----getProductRequestFilterBySource-----");
    
        let queryString = `SELECT id,orderdate,ordername,orderstatus,customerimages FROM photoorder WHERE status LIKE ? ORDER BY orderdate desc`;
        console.log(queryString);
        queryString = mysql.format(queryString, [`%${source}%`]);
        let result = await connection.asyncQuery(queryString);
        result = Object.values(JSON.parse(JSON.stringify(result)));
        // result.forEach(element => {
        //     if (element.products !== null) {
        //         element.products = JSON.parse(element.products);
        //     }
        // });
        connection.end();
        return result;
        
    }*/

    async updateOrderStatusSubmitted(orderid, status,totalSubmitted) {
        let connection = this.connection;
        console.log("-----updateOrderStatus-----");
        let queryString;

       
        queryString = `UPDATE photoorder SET orderstatus = ?,totalsubmitted = ? where id = ?`;
        queryString = mysql.format(queryString, [status, totalSubmitted,orderid]);
        
        console.log(queryString);  
        let result = await connection.asyncQuery(queryString);
        result = Object.values(JSON.parse(JSON.stringify(result)));
        //connection.end();
        return result;
    }



    async updateOrderStatus(orderid, status,totalGenerated) {
        let connection = this.connection;
        console.log("-----updateOrderStatus-----");
        let queryString;

        if(!totalGenerated){
            queryString = `UPDATE photoorder SET orderstatus = ?where id = ?`;
            queryString = mysql.format(queryString, [status ,orderid]);
        }
        else
        {
            queryString = `UPDATE photoorder SET orderstatus = ?,totalgenerated = ? where id = ?`;
            queryString = mysql.format(queryString, [status, totalGenerated,orderid]);
        }
        console.log(queryString);  
        let result = await connection.asyncQuery(queryString);
        result = Object.values(JSON.parse(JSON.stringify(result)));
        //connection.end();
        return result;
    }

    async updateOrderGenerated(orderid, totalGenerated) {
        let connection = this.connection;
        console.log("-----updateOrderStatus-----");
    
        let queryString = `UPDATE photoorder SET totalgenerated = ? where id = ?`;
        console.log(queryString);
        queryString = mysql.format(queryString, [ totalGenerated,orderid]);
        let result = await connection.asyncQuery(queryString);
        result = Object.values(JSON.parse(JSON.stringify(result)));
        //connection.end();
        return result;
    }

    async emailFromOrder(data)
    {
        let connection = this.connection;
        let queryString = `SELECT email FROM photoorder WHERE id=${data.orderid}`;
        var email;

        console.log(queryString);
        let result = await connection.asyncQuery(queryString);
       // console.log('query result: ',queryResult);
        result =  Object.values(JSON.parse(JSON.stringify(result)));
        if(result.length>0)
            email=result[0].email;


        //connection.end();
        //console.log('result: ',result)
       // console.log(result);
        return email;
    }

    async orderDetails(data)
    {
        let connection = this.connection;
        let queryString = `SELECT ordername,email,orderdate FROM photoorder WHERE id=${data.orderid}`;
   
        console.log(queryString);
        let result = await connection.asyncQuery(queryString);
       // console.log('query result: ',queryResult);
        result =  Object.values(JSON.parse(JSON.stringify(result)));


        //connection.end();
        //console.log('result: ',result)
       // console.log(result);
        return result[0];
    }

    async registerPayment(data) {

        let connection = this.connection;
        console.log("-----registerPayment-----");
       
        if (data !== undefined && data !== null) {
            //6 digits
          
            console.log("formatedData: ", data);
           
            let queryString = `INSERT INTO checkoutorder (sessionid, cartimages, amount, customername,customeremail) VALUES (?,?,?,?,?)`;

            queryString = mysql.format(queryString, [data.sessionid,data.cartimages,data.amount,data.customername,data.customeremail]);
            console.log(queryString);
            await connection.asyncQuery(queryString);
            
           
        }
        //connection.end();

        
    }

    async photosFromSession(data)
    {
        if(data.sessionid)
        {
            let connection = this.connection;
            let queryString = `SELECT cartimages FROM checkoutorder WHERE sessionid="${data.sessionid}"`;
            var cartimages;
    
            console.log(queryString);
            let result = await connection.asyncQuery(queryString);
           // console.log('query result: ',queryResult);
            result =  Object.values(JSON.parse(JSON.stringify(result)));
            if(result.length>0)
            {
                //orderid=result[0].orderid;
                cartimages=result[0].cartimages;
                return {cartimages:JSON.parse(cartimages)};
            }
            else
                return;
            
            
            //connection.end();
            //console.log('result: ',result)
           // console.log(result);
            
        }
    }

    async orderCustomerImages(data)
    {
        let connection = this.connection;
        let queryString = `SELECT customerimages,ordername FROM photoorder WHERE id=${data.orderid}`;
   
        console.log(queryString);
        let result = await connection.asyncQuery(queryString);
       // console.log('query result: ',queryResult);
        result =  Object.values(JSON.parse(JSON.stringify(result)));


        //connection.end();
        //console.log('result: ',result)
       // console.log(result);
        return result[0];
    }





}

module.exports =  OrderQueries;
