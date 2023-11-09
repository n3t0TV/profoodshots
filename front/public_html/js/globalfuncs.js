async function downloadFile(url, filename) {
    try {
        // Fetch the file
        const response = await fetch(url);
        
        // Check if the request was successful
        if (response.status == 500) {
            //throw new Error(`Unable to download file. HTTP status: ${response.status}`);
            Swal.fire({
                icon: 'error',
                title: 'Ups!',
                text: 'Something went wrong!'
                });
            return response;
        }

        // Get the Blob data
        const blob = await response.blob();

        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = filename;

        // Trigger the download
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // Clean up
        setTimeout(() => {
        URL.revokeObjectURL(downloadLink.href);
        document.body.removeChild(downloadLink);
        }, 100);

        return response;
    } catch (error) {
        console.error('Error downloading the file:', error.message);
    }
}


