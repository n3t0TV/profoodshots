$(document).ready(function () {

    Swal.fire({
        icon: 'error',
        title: 'Payment not completed!',
        //confirmButtonText:'Download',
        text: `Your payment failed or was cancelled.`
    }).then((result)=>{
        console.log('Payment failed');
        window.location.replace("/index.html");
    });
});