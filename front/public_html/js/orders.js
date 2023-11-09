
function refreshTable()
{

    toastr.options = {
        "hideDuration": "500",
        "timeOut": "3000",
    };

    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    var status = urlParams.get('status');
    console.log("STATUS QUERY: ", status);


    let url = '/getorders';
    if (status !== null) {
        url = `/getorders?status=${status}`;
    }


    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        success: function (queries) {

            console.log('result: '+JSON.stringify(queries));
           

            //('#queriesTable thead').empty();
            const thead = $('#queriesTable thead');
            thead.empty();
            const tr = $('<tr>');
            const headers = ['Order #', 'Email','Date', 'Name', 'Status','# Photos', 'Image', 'Actions'];

            headers.forEach(header => {
                const th = $('<th>').text(header);
                tr.append(th);
            });

            thead.append(tr);
           // $('#queriesTable').append(thead);

            $.fn.dataTable.ext.errMode = 'none';

            $('#queriesTable thead th').css('background-color', "#1C1C1C");
            $('#queriesTable thead th').css('color', "white");

            /*$('#example').on('error.dt', function (e, settings, techNote, message) {
                console.log('An error has been reported by DataTables: ', message);
            }).DataTable();*/

            var queriesTable = $('#queriesTable').DataTable({
                "pageLength": 25,
                scrollX: true,
                sScrollXInner: "100%",
                data: queries,
                columns: [
                    { title: headers[0], data: 'id' },
                    { title: headers[1], data: 'email' },
                    { title: headers[2], data: 'orderdate' },
                    { title: headers[3], data: 'ordername' },
                    { title: headers[4], data: 'orderstatus' },
                   /* { title: headers[5], data: 'totalgenerated'},*/
                    { title: headers[5], render: function (data, type, row) {
                        let photosString='';
                        if (row.customerimages == null || row == null) {
                            return "";
                        }
                        photosString='⇧'+row.totaluploaded+' ⚙ '+row.totalgenerated + ' ✎ ' + row.totalsubmitted;

                        return photosString;
                        }
                    },
                    { title: headers[6], render: function (data, type, row) {

                            try {
                                let imgInsert = "";

                                if (row.customerimages == null || row == null) {
                                    return "";
                                }

                                //let tmpJson = JSON.parse(row.customerimages);
                               //console.log(tmpJson[0]);
                               //"
                               const profileimg = '/assets/img/profile/'+row.id+'.png';
                                imgInsert = `<img class="img-mini" src=" ${profileimg} "  onerror="this.onerror=null; this.src='/assets/img/profile/default.png';" alt="Imagen">`;
                                return imgInsert;
                            }
                            catch (error) {
                                console.log(error);
                            }

                        }
                    },
                    {
                        title: headers[7], render: function (data, type, row) {
                            var actions='';

                           // if(row.orderstatus!=='Closed')
                            //{
                                actions+='<div class="container mt-4"> <div class="row justify-content-center"> <div class="col-12 text-center">'+
                                '<button type="button" class="btn btn-primary mx-1" id="order'+row.id+'">Download</button>'+
                                '<button type="button" class="btn btn-success mx-1" id="submit'+row.id+'">Submit</button>'+
                                '<button type="button" class="btn btn-secondary mx-1" id="suball'+row.id+'">SubmitAll</button>'+
                                '<button type="button" class="btn btn-warning mx-1" id="restart'+row.id+'">Regenerate</button>'+
                                '<button type="button" class="btn btn-light mx-1" id="gallery'+row.id+'">Gallery</button>'+ 
                                '<button type="button" class="btn btn-danger mx-1" id="close'+row.id+'">Clear</button>'+
                                  
                                '</div></div></div>';
                            //}
                            /*else{
                                actions+=
                                '<button type="button" class="btn btn-danger" id="stop'+row.id+'">Reset</button>'
                            }*/
                            return actions;
                            
                        }
                    }
                ],
            });

       

            $('button[id^="order"]').click(async event=> {
               // event.preventDefault(); // Prevent the default link behavior (i.e., navigating to "#")
                 console.log(event.target.id);
                const orderid = event.target.id.split('order')[1];
                console.log('Clicked download on: '+orderid);
                // Send an AJAX request to the server to trigger the file download
                const loadingAlert =swal.fire({
                    title: 'Downloading',
                    text: 'Please wait...',
                    allowOutsideClick: false,
                    onBeforeOpen: () => {
                      swal.showLoading();
                    }
                  });
                //window.open();
                const response = await downloadFile("/downloadOrder?orderid="+orderid, orderid+'.zip');
                loadingAlert.close();
                if(response.status==200)
                {
                    Swal.fire({
                        icon: 'success',
                        title: 'Downloaded!',
                        //confirmButtonText:'Download',
                        text: `Your zip file has been downloaded!`
                    }).then((result)=>{
                        console.log('Download confirmed');
                        //window.location.replace("/index.html");
                    });
                }
                  
              });

             

               $('button[id^="gallery"]').click(function (event)  {
                    const orderid = $(this).attr('id').split('gallery')[1];
                    console.log('Clicked submit on: '+orderid);
                    window.location.replace("/shopgallery.html?orderid="+orderid);

               });

               


              $('button[id^="close"]').click(function (event) {
               // event.preventDefault(); // Prevent the default link behavior (i.e., navigating to "#")
                const orderid = $(this).attr('id').split('close')[1];
                console.log('Clicked close on: '+orderid);
                // Send an AJAX request to the server to trigger the file download

                Swal.fire({
                    title: 'Are you sure?',
                    text: "This will close the order permanently",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Confirm'
                  }).then((result) => {
                    if (result.isConfirmed) {
                                
                        $.ajax({
                            url: `/completeOrder?orderid=`+orderid,
                            type: 'GET',
                            success: function (response) {
                                window.location.reload();

                                // Manejar la respuesta del servidor si la petición fue exitosa
                                //toastr.success('Order closed!');
                            },
                            error: function (error) {
                                // Manejar la respuesta del servidor si la petición falló
                                toastr.error('Error while updating request');
                            }
                        });
                    }
                });

                

          
              });

              $('button[id^="restart"]').click(function (event) {
                // event.preventDefault(); // Prevent the default link behavior (i.e., navigating to "#")
                 const orderid = $(this).attr('id').split('restart')[1];
                 console.log('Clicked restart on: '+orderid);
                 // Send an AJAX request to the server to trigger the file download
 
                 Swal.fire({
                     title: 'Are you sure?',
                     text: "This will regenerate the order, all previous images will be deleted",
                     icon: 'warning',
                     showCancelButton: true,
                     confirmButtonColor: '#3085d6',
                     cancelButtonColor: '#d33',
                     confirmButtonText: 'Confirm'
                   }).then((result) => {
                     if (result.isConfirmed) {
                                 
                         $.ajax({
                             url: `/restartOrder?orderid=`+orderid,
                             type: 'GET',
                             success: function (response) {
                                 window.location.reload();
 
                                 // Manejar la respuesta del servidor si la petición fue exitosa
                                 //toastr.success('Order closed!');
                             },
                             error: function (error) {
                                 // Manejar la respuesta del servidor si la petición falló
                                 toastr.error('Error while updating request');
                             }
                         });
                     }
                 });
 
                 
 
           
               });
 




              $('button[id^="submit"]').click(function (event){
                //event.preventDefault(); // Prevent the default link behavior (i.e., navigating to "#")
                const orderid = $(this).attr('id').split('submit')[1];
                console.log('Clicked submit on: '+orderid);
                window.location.replace("/submit.html?orderid="+orderid);
                // Send an AJAX request to the server to trigger the file download

              
                });

                $('button[id^="suball"]').click(function (event){
                    //event.preventDefault(); // Prevent the default link behavior (i.e., navigating to "#")
                    const orderid = $(this).attr('id').split('suball')[1];
                    console.log('Clicked submitall on: '+orderid);
                    Swal.fire({
                        title: 'Are you sure?',
                        text: "This will share all generated photos with customer",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Confirm'
                      }).then((result) => {
                        if (result.isConfirmed) {
                                    
                            $.ajax({
                                url: `/submitGalleryPhotos?orderid=`+orderid,
                                type: 'GET',
                                success: function (response) {
                                    window.location.reload();
    
                                    // Manejar la respuesta del servidor si la petición fue exitosa
                                    //toastr.success('Order closed!');
                                },
                                error: function (error) {
                                    // Manejar la respuesta del servidor si la petición falló
                                    toastr.error('Error while updating request');
                                }
                            });
                        }
                    });



                    
           
                    // Send an AJAX request to the server to trigger the file download
    
                  
                    });

           
        }
    });

}


$(document).ready(function () {

    console.log('Orders loading...');

   

    refreshTable();

   

});