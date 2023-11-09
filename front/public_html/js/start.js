
//var serverimagename;
//var serverimagenames=['','','','',''];
var serverimagenames=[];
//var browserimagenames=[];
var tagifyIngredients;


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

//Upload image using file
function uploadImageFile(file)
{

    var formData = new FormData();

    formData.append("image", file);

    fetch("/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.imagepath);
         console.log("Image uploaded successfully!", data.imagehost+data.imagepath);

         //$('#'+imageId).attr("src",window.location.origin+"/"+data.imagepath);
         //const index = parseInt(inputId.charAt(inputId.length-1))-1;
         serverimagenames.push(data.imagehost+data.imagepath);

         //browserimagenames.push(data.imagepath);
         console.log(JSON.stringify(serverimagenames));

        refreshCarousel(serverimagenames);
        
    })
    .catch(error => {
      console.error("Error uploading image:", error);
    });


      
}


function onAddTag(e){
    // limit to "5" tags
    
    const ingredientValues = tagifyIngredients.value.map(tag => tag.value);
    console.log('Tag added!',ingredientValues.length);
    if( ingredientValues.length > 6 )
   // document.querySelector('input[name=ingredients]')
        tagifyIngredients.removeTag(0);
}

function generate()
{
        
    const ingredientValues = tagifyIngredients.value.map(tag => tag.value);
    console.log(ingredientValues);
    const foodname = $('#inputText').val();
    const email = $('#email').val();
    const photosUploaded=serverimagenames.filter(element => element !== '').length

    if (!foodname)
    {
        Swal.fire({
            icon: 'error',
            title: 'Ups!',
            text: 'Please name your food or beverage!'
        });
        return;
    }

    if(!email)
    {
        Swal.fire({
            icon: 'error',
            title: 'Ups!',
            text: 'Please share your email!'
        });
        return; 
    }
    console.log('Processing photos');
    Swal.fire({
        title: 'Are you sure?',
        text: "You'll receive your photoshot via email",
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm'
      }).then((result) => {
        if (result.isConfirmed) {
            
                const params = {
                    imageurllist: serverimagenames,
                    imagename: foodname,
                    ingredients:ingredientValues,
                    email:email
                
                }
                console.log('params: ',JSON.stringify(params));

                fetch("/generate", {
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
                    if(!data.orderid)
                    {
                        console.error("Error generating order id:", error);
                        Swal.fire({
                        icon: 'error',
                        title: 'Ups!',
                        text: 'Something went wrong!'
                        });
                        return;
                    }
                 
                    Swal.fire({
                        icon: 'success',
                        title: 'Order received!',
                        text: 'Your order id is: '+data.orderid+` you'll receive a confirmation at `+email+' Please check your inbox and spam folders'
                    }).then((result)=>{
                        console.log('Order confirmed');
                        window.location.replace("/index.html");
                    });
                    console.log("Images generated successfully!");
                
                })
                .catch(error => {
                        console.error("Error generating images:", error);
                        Swal.fire({
                        icon: 'error',
                        title: 'Ups!',
                        text: 'Something went wrong!'
                        })
                });
          
        }
      });

}
$(document).ready(function () {

   
    $('#load').hide();
    $('#carouselGallery').hide();

    /*$('#imageFile').change(function(){
        console.log("Image file changed!");
        uploadImage("imageFile","originalImage");
    });*/

   

    $('#muliplefiles').change(function() {
        const files = this.files;
        const indexArray = Object.keys(files);
   
        //Cut to the first 5 elements
        //indexArray.splice(5);
        indexArray.forEach(index => {
            //console.log(file);
            uploadImageFile(files[index]);
            
        });
      });



    var inputIngredients = document.querySelector('input[name=ingredients]');
   // var inputBackground = document.querySelector('input[name=background]');
    // initialize Tagify on the above input node reference
    tagifyIngredients = new Tagify(inputIngredients,{
        callbacks : { add:onAddTag }
    });
    //var tagifyBackground = new Tagify(inputBackground);
    
    $('#genButton').click(function () {
        console.log('Generate click');
        generate();

    });
  
});
