

class CartItem
{
  constructor(_productid,_price,_quantity,_name,_imageurl)
  {
    this.productid=_productid;
    this.price=_price;
    this.quantity=_quantity;
    this.name=_name;
    this.imageurl=_imageurl;
  }

  addQuantity(_quantity)
  {
    this.quantity+=_quantity;
  }
}

class CartSession
{

  constructor()
  {
    this.list=[];
    this.orderid=false;
    this.email=false;
  }

  initializeNewCart(_email,_orderid,_list)
  {
    this.email=_email;
    this.orderid=_orderid;
    this.list=_list;
   

  }


  containsItem(_productid)
  {
    for(var i = 0; i < this.list.length ; i++)
    {
        if(this.list[i].productid == _productid)
        {
            return this.list[i];
        }
    }
    return false;
  }

  addItem(_productid,_price,_quantity,_name,_imageurl)
  {
    console.log('Adding: ',_productid,_price,_quantity,_name,_imageurl);
    const item=this.containsItem(_productid);
   // var newQuantity=_quantity;
    if(!item)
    {
      const item = new CartItem(_productid,_price,_quantity,_name,_imageurl);
      this.list.push(item);
    }
    else
    {
      //Already added!!
     // item.quantity+=_quantity;
     // newQuantity=item.quantity;
    }
    //dbcalls.setCartItem({cartid:this.cartid,productid:_productid,quantity:newQuantity,name:_name,price:_price,imageurl:_imageurl});
  }


  totalAmount()
  {
    var amount=0;
    for(var i = 0; i < this.list.length ; i++)
    {

      amount+=(this.list[i].quantity*this.list[i].price);

    }
    amount=parseFloat(amount).toFixed(2);
    return amount;
  }

  totalItems()
  {
    var numItems=0;
  
    for(var i = 0; i < this.list.length ; i++)
    {
      numItems+=(this.list[i].quantity);

    }
    return numItems;
  }

 
  //keeps cart in database for future use
  clearCart()
  {

    //this.email=false;
    this.list=[];//clear items


  }

  getJson()
  {
    var json = JSON.stringify(this.list);
  }


}

module.exports = CartSession;
