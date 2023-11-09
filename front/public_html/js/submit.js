var orderid;
var serverimagenames=[];

function uploadImageFile(orderid,file)
{

    var formData = new FormData();

    formData.append("image", file);
    formData.append("orderid",orderid)

    fetch("/uploadResult", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
       
         console.log("Image uploaded successfully!");

         //$('#'+imageId).attr("src",window.location.origin+"/"+data.imagepath);
         //const index = parseInt(inputId.charAt(inputId.length-1))-1;
         console.log( data.imagehost+data.imagepath);
         serverimagenames.push(data.imagehost+data.imagepath);
         console.log(JSON.stringify(serverimagenames));

        refreshCarousel(serverimagenames);
        
    })
    .catch(error => {
      console.error("Error uploading image:", error);
    });


      
}

function refreshCarousel(images)
{
     // Generate carousel items and append to the carousel container
     $('#carouselGallery').show();
     const carouselContainer = $('#carousel');
     carouselContainer.empty();
     var i=1;
     images.forEach(function(serverfilename, index) {
         const carouselItem = $('<div>').addClass('carousel-item' + (index === 0 ? ' active' : ''));
         const img = $('<img>').attr({
         id: i,
         class: 'd-block w-100',
         src: serverfilename,
         alt:i+'Slide'
         });
         carouselItem.append(img);
         carouselContainer.append(carouselItem);
     
         i++;
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


$(document).ready(function () {

    console.log('submit js');
    $('#carouselGallery').hide();
    const urlSearchParams  = new URLSearchParams(window.location.search);
    orderid = urlSearchParams.get('orderid');
    if(!orderid)
        return;


    $('#muliplefiles').change(function() {
        const files = this.files;
        const indexArray = Object.keys(files);
   
        indexArray.forEach(index => {
            //console.log(file);
            uploadImageFile(orderid,files[index]);
            
        });
      });


      $('#finishButton').click(function () {
        console.log('Finish click');

        Swal.fire({
            title: 'Are you sure?',
            text: "We'll share this photos with the customer",
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirm'
          }).then((result) => {
            if (result.isConfirmed) {
                console.log('Submiting results...');


                const params = {
                    imageurllist: serverimagenames,
                    orderid: orderid             
                }
                console.log('params: ',JSON.stringify(params));

                fetch("/submitPhotoshot", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                        },
                    body: JSON.stringify(params)
                })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    //data.orderid (resulting id )
                    //updateGallery(data.urlarray);
                   
                    Swal.fire({
                        icon: 'success',
                        title: 'Order submitted!',
                        text: 'An email has been sent to the customer!'
                    }).then((result)=>{
                        console.log('Order submitred!');
                        window.location.replace("/orders");
                    });
                    console.log("Images submitted successfully!");
                
                })
                .catch(error => {
                        console.error("Error submitting images");
                        Swal.fire({
                        icon: 'error',
                        title: 'Ups!',
                        text: 'Something went wrong!'
                        })
                });



        


            }
        });


        

    });



});