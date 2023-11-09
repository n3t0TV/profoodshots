
$(document).ready(async function () 
{
    //Random local name
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionid =urlParams.get('sessionid');

    const loadingAlert =swal.fire({
        title: 'Downloading',
        text: 'Please wait...',
        allowOutsideClick: false,
        onBeforeOpen: () => {
          swal.showLoading();
        }
      });


    var downloadLink = '/validPayment';
    var localzipname='profoodshots-'+(Math.floor(Math.random()*90000) + 10000);
    if(sessionid)
    {
      downloadLink +='?sessionid='+sessionid;
      
    }
    const response =await downloadFile(downloadLink, localzipname,+'.zip');
    loadingAlert.close();
    if(response.status==200)
    {
        Swal.fire({
            icon: 'success',
            title: 'Photos downloaded!',
            //confirmButtonText:'Download',
            text: `Your file has been downloaded! `
        }).then((result)=>{
            console.log('Download confirmed');
            window.location.replace("/index.html");
        });
    }
    
});