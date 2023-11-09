
//const imageserver='' //same as frontend
//const imageserver='https://profoodshots.com'

function getFileNameWithoutExtension(url) 
{
    const pathSegments = url.split('/');
    const fileNameWithExtension = pathSegments[pathSegments.length - 1];
    const fileNameWithoutExtension = fileNameWithExtension.split('.').slice(0, -1).join('.');
    return fileNameWithoutExtension;
}

function photodiv(serverfilename)
{
    
    
    const outerDiv = $('<div>').addClass('col-lg-4 col-md-6 portfolio-item filter-app');

    // Create the portfolio-wrap div
    const portfolioWrapDiv = $('<div>').addClass('portfolio-wrap');

    // Create the img element and set its 'src' and 'alt' attributes
    const imgElement = $('<img>').attr('src', serverfilename).addClass('img-fluid').attr('alt', '');

    // Create the portfolio-info div
    const portfolioInfoDiv = $('<div>').addClass('portfolio-info');

    // Create the h4 element (you can set its text content here)
    const h4Element = $('<h4>').text('');

    // Create the portfolio-links div
    const portfolioLinksDiv = $('<div>').addClass('portfolio-links');

    // Create the anchor element for the lightbox
    const lightboxAnchor = $('<a>').attr('href', serverfilename).attr('data-gallery', 'portfolioGallery').addClass('portfokio-lightbox').attr('title', '');
    
    const addAnchor = $('<a>');
    addAnchor.attr('href', '#').attr('title', 'Add to cart').attr('id','add-'+serverfilename);
    addAnchor.on('click', function(event) {
        // Prevent the default behavior of the link (e.g., navigating to a new page)
        event.preventDefault();

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
                    gtag('event', 'shopgallery-added',{'orderid':orderid});
                })


            },
            error: function(error) {
                console.error('Error:', error);
            }
            });



        // Your click event handling code here
       // alert('Link clicked!');
    });


    const iconAddElement = $('<i>').addClass('bi bi-cart-plus');
    addAnchor.append(iconAddElement);
    //const addAnchor = $('<a href="portfolio-details.html" title="Add to cart"><i class="bi bi-cart-plus"></i></a>');

    // Create the icon element for the lightbox
    const iconElement = $('<i>').addClass('bi bi-arrows-angle-expand');

    // Append elements to their respective parent elements
    lightboxAnchor.append(iconElement);
    portfolioLinksDiv.append(lightboxAnchor);
    portfolioLinksDiv.append(addAnchor);
    portfolioInfoDiv.append(h4Element, portfolioLinksDiv);
    portfolioWrapDiv.append(imgElement, portfolioInfoDiv);
    outerDiv.append(portfolioWrapDiv);



    /*var htmlText =` 
        <div class="col-lg-4 col-md-6 portfolio-item">
            <div class="portfolio-wrap">
                <img src=${serverfilename} class="img-fluid" alt="">
                <div class="portfolio-info">
                    <h4></h4>
                    <div class="portfolio-links">
                    <a href=${serverfilename} data-gallery="portfolioGallery" class="portfokio-lightbox" title="Cheeseburger"><i class="bi bi-arrows-angle-expand"></i></a>
                   
                    </div>
                </div>
            </div>
        </div>`;*/
    return outerDiv;
}
function refreshGallery(imagelist)
{
    console.log('Refresh gallery');

   // const sectionContainer = $('#portfolio');

    //galleryContainer.empty();

        var numrow=0;
        var numcol=0;

        const section = $('<section id="portfolio" class="portfolio">');
        const gallery = $('<div class="container" data-aos="fade-up">');
       
        //const row = $('#galleryrow');
        //console.log(row);
        const row = $('<div class="row gy-4 portfolio-container" data-aos="fade-up" data-aos-delay="200">');

        
      
        imagelist.forEach(function(serverfilename, index) {
          
          
            const imageid = getFileNameWithoutExtension(serverfilename);

            
            //var div =photodiv('assets/img/portfolio/portfolio-1.jpg');
            var div =photodiv(imagelist[index]);

            row.append(div);

            
        });

        
        gallery.append(row);
        section.append(gallery);
        $('main').append(section);

        const portfolioLightbox = GLightbox({
            selector: '.portfokio-lightbox'
          });


}

function initCart()
{
    $.ajax({
        url: `/getCart?orderid=`+orderid,
        type: 'GET',
        success: function (data) {
            console.log(data.ordername);
            
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
    gtag('event', 'shopgallery-open',{'orderid':orderid});
   
    $.ajax({
        url: `/watermarkPhotoList?orderid=`+orderid,
        type: 'GET',
        success: function (response) {
            console.log(response.imagelist);
            
            refreshGallery(response.imagelist);
            
          
            // Manejar la respuesta del servidor si la petición fue exitosa
            //toastr.success('Order closed!');
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
                swal.fire({
                    icon: 'success',
                    title: 'Your cart is empty!',
                    timer: 2000,
                    showCancelButton: false,
                    showConfirmButton: false
                    
                    }).then((result) => {
                        gtag('event', 'shopgallery-clear',{'orderid':orderid});
                        })
                
            },
            error: function (error) {
                
                console.error('Error while updating request');
            }
        });
        

    });

    $('#checkoutCart').click(function () {
        gtag('event', 'shopgallery-buy',{'orderid':orderid});
        console.log('Checkout clicked!!');
        
    });
    initCart();
   

  
});