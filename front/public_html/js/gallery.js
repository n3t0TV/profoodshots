
//const imageserver='' //same as frontend
const imageserver='$YOUR_DOMAIN'

function getFileNameWithoutExtension(url) 
{
    const pathSegments = url.split('/');
    const fileNameWithExtension = pathSegments[pathSegments.length - 1];
    const fileNameWithoutExtension = fileNameWithExtension.split('.').slice(0, -1).join('.');
    return fileNameWithoutExtension;
}


function refreshCarousel(imagelist)
{
    console.log('Refresh carousel');
     // Generate carousel items and append to the carousel container
     $('#carouselGallery').show();
     const carouselContainer = $('#carousel');

        carouselContainer.empty();
        
        var active='';
        imagelist.forEach(function(serverfilename, index) {
            
            if(index==0)
                active='active';
            else
                active='';

            const imageid = getFileNameWithoutExtension(serverfilename);
            carouselContainer.append( `   <div class="carousel-item ${active}"> 
                <div class="cartimage">
                <img src="${imageserver+'/'+serverfilename}" class="img-fluid img-fluid. max-width: 100%" alt="">
                <div class="cartbutton"> 
                    <button id="add-${serverfilename}" class="btn btn-dark " style="font-size: 30px;"><span class="bi bi-cart-plus" style="font-size: 50px;"></span> Buy photo</button>
                </div>
                </div>
            </div>`);
        });

        $('button[id^="add-"]').click(function(event) {
            console.log('Clicked on add');
            console.log($(this).attr('id'));
            const imageurl = $(this).attr('id').split('add-')[1];
            console.log('Clicked on: '+imageurl);
            const queryParams = {
                orderid: orderid,
                imageurl: imageurl
              };

            $.ajax({
                url: '/addCartItem',
                data: queryParams,
                success: function(data) {
                  console.log('Response:', data);

                  $('#totalPhotos').html(data.totalItems);

                 
                    swal.fire({
                    icon: 'success',
                    title: 'Photo added to cart!',
                    timer: 2000,
                    showCancelButton: false,
                    showConfirmButton: false
                    
                    }).then((result) => {
                        
                        })


                },
                error: function(error) {
                  console.error('Error:', error);
                }
              });


    
        });
       

        carouselContainer.append(
         `  <a class="carousel-control-prev" data-target="#carouselGallery" role="button" data-slide="prev">
             <span class="carousel-control-prev-icon" aria-hidden="true"></span>  </a>
            <a class="carousel-control-next" data-target="#carouselGallery" role="button" data-slide="next">
             <span class="carousel-control-next-icon" aria-hidden="true"></span>`
     );

     $(".carousel-control-prev").click(function () {
         $("#carouselGallery").carousel("prev");
     });
     $(".carousel-control-next").click(function () {
         $("#carouselGallery").carousel("next");
     });

}

function initCart()
{
    $.ajax({
        url: `/getCart?orderid=`+orderid,
        type: 'GET',
        success: function (data) {
            console.log(data);
            $('#orderheader').html(data.ordername);
            $('#totalPhotos').html(data.totalItems);
            $('#orderfooter').html('Order #'+orderid);
            
        },
        error: function (error) {
            
            console.error('Error while updating request');
        }
    });
}

$(document).ready(function ()
{
    console.log('Ready!');
    const urlSearchParams  = new URLSearchParams(window.location.search);
    orderid = urlSearchParams.get('orderid');
    if(!orderid)
        return;

    $('#orderid').val(orderid);

   
    $.ajax({
        url: imageserver+`/watermarkPhotoList?orderid=`+orderid,
        type: 'GET',
        success: function (response) {
            console.log(response.imagelist);
            
            refreshCarousel(response.imagelist);
           
        },
        error: function (error) {
            // Manejar la respuesta del servidor si la petición falló
            console.error('Error while updating request');
        }
    });

    $('#clearCart').click(function () {
        console.log('Clear cart click');
        $.ajax({
            url: `/clearCart?orderid=`+orderid,
            type: 'GET',
            success: function (data) {
                console.log(data);
                $('#totalPhotos').html(data.totalItems);
                
            },
            error: function (error) {
                
                console.error('Error while updating request');
            }
        });
        

    });

    $('#checkoutCart').click(function () {
        console.log('Checkout clicked!!');
        
    });

    initCart();

  
});