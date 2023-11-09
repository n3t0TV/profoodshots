const { MailerSend, EmailParams, Sender, Recipient } =require("mailersend");
const fs = require('fs');

class Mailer
{
    constructor()
    {
       this.initAPI();
    }

    initAPI()
    {
        const projectDir = process.cwd();
        console.log(projectDir);
        const data =fs.readFileSync(projectDir + '/config/mailersend.json', 'utf8');
        let configJson = JSON.parse(data);
        console.log('Mailer key loaded');
        this.API_KEY=configJson.API_KEY;
        //console.log(this.API_KEY);
    }

    getHtmlTemplate(galleryLink,textContent)
    {

        return `<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head>
        <title> ProFoodShots </title>
        <!--[if !mso]><!-- -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <!--<![endif]-->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style type="text/css">
            #outlook a {
            padding: 0;
            }

            body {
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            }

            table,
            td {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            }

            img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
            }

            p {
            display: block;
            margin: 13px 0;
            }
        </style>
        <!--[if mso]>
                <xml>
                <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
                </xml>
                <![endif]-->
        <!--[if lte mso 11]>
                <style type="text/css">
                .mj-outlook-group-fix { width:100% !important; }
                </style>
                <![endif]-->
        <!--[if !mso]><!-->
        <link href="https://fonts.googleapis.com/css?family=Muli:300,400,700" rel="stylesheet" type="text/css" />
        <style type="text/css">
            @import url(https://fonts.googleapis.com/css?family=Muli:300,400,700);
        </style>
        <!--<![endif]-->
        <style type="text/css">
            @media only screen and (min-width:480px) {
            .mj-column-per-100 {
                width: 100% !important;
                max-width: 100%;
            }
            }
        </style>
        <style type="text/css">
            @media only screen and (max-width:480px) {
            table.mj-full-width-mobile {
                width: 100% !important;
            }

            td.mj-full-width-mobile {
                width: auto !important;
            }
            }
        </style>
        <style type="text/css">
            a,
            span,
            td,
            th {
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            }
        </style>
        </head>

        <body style="background-color:#e5f4fe;">
        <div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;"></div>
        <div style="background-color:#e5f4fe;">
            <!--[if mso | IE]>
            <table
                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
            >
                <tr>
                <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
            <![endif]-->
            <div style="margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tbody>
                <tr>
                    <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                    <!--[if mso | IE]>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">

                <tr>

                    <td
                    class="" style="vertical-align:top;width:600px;"
                    >
                <![endif]-->
                    <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tbody><tr>
                            <td style="font-size:0px;word-break:break-word;">
                            <!--[if mso | IE]>

                <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td height="20" style="vertical-align:top;height:20px;">

            <![endif]-->
                            <div style="height:20px;">   </div>
                            <!--[if mso | IE]>

                </td></tr></table>

            <![endif]-->
                            </td>
                        </tr>
                       
                        </tbody></table>
                    </div>
                    <!--[if mso | IE]>
                    </td>

                </tr>

                        </table>
                        <![endif]-->
                    </td>
                </tr>
                </tbody>
            </table>
            </div>
            <!--[if mso | IE]>
                </td>
                </tr>
            </table>

                <table
                align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:600px;" width="600"
                >
                <tr>
                    <td  style="line-height:0;font-size:0;mso-line-height-rule:exactly;">
                    <v:image
                        style="border:0;mso-position-horizontal:center;position:absolute;top:0;width:600px;z-index:-3;" src="https://images.unsplash.com/photo-1536560035542-1326fab3a507?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80" xmlns:v="urn:schemas-microsoft-com:vml"
                    />
            <![endif]-->
            <div style="margin:0 auto;max-width:600px;">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tbody><tr style="vertical-align:top;">

                    <div class="mj-hero-content" style="margin:0px auto;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;margin:0px;">
                        <tbody><tr>
                        <td style="">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;margin:0px;">
                            </table>
                        </td>
                        </tr>
                    </tbody></table>
                    </div>
                    <!--[if mso | IE]>
                    </td>
                </tr>
                </table>
            <![endif]-->
                </td>
                </tr>
            </tbody></table>
            </div>
            <!--[if mso | IE]>
                </td>
                </tr>
            </table>

            <table
                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
            >
                <tr>
                <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
            <![endif]-->
            <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
                <tbody>
                <tr>
                    <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                    <!--[if mso | IE]>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">

                <tr>

                    <td
                    class="" style="vertical-align:top;width:600px;"
                    >
                <![endif]-->
                    <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tbody><tr>
                            <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                            <div style="font-family:Muli, Arial, sans-serif;font-size:20px;font-weight:400;line-height:30px;text-align:left;color:#333333;">
                                <h1 style="margin: 0; font-size: 24px; line-height: normal; font-weight: bold;">${textContent[0]}</h1>
                            </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="font-size:0px;padding:10px 25px;word-break:break-word;">
                            <p style="border-top: solid 1px #F4F5FB; font-size: 1px; margin: 0px auto; width: 100%;">
                            </p>
                            <!--[if mso | IE]>
                <table
                align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 1px #F4F5FB;font-size:1px;margin:0px auto;width:550px;" role="presentation" width="550px"
                >
                <tr>
                    <td style="height:0;line-height:0;">

                    </td>
                </tr>
                </table>
            <![endif]-->
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                            <div style="font-family:Muli, Arial, sans-serif;font-size:16px;font-weight:400;line-height:20px;text-align:left;color:#333333;">
                                <p style="margin: 0;">${textContent[1]}</p>
                            </div>
                            </td>
                        </tr>
                        <tr>
                            <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                            <div style="font-family:Muli, Arial, sans-serif;font-size:16px;font-weight:400;line-height:20px;text-align:left;color:#333333;">
                                <a style="margin: 0;" href="${galleryLink}">${textContent[2]}</a>
                            </div>
                            </td>
                        </tr>
                        </tr>
                        <tr>
                            <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                            <div style="font-family:Muli, Arial, sans-serif;font-size:14px;font-weight:400;line-height:20px;text-align:left;color:#333333;">
                                <p style="margin: 0;"></p>${textContent[3]}<p style="margin: 0;"></p>
                            </div>
                            </td>
                        </tr>
                        </tbody></table>
                    </div>
                    <!--[if mso | IE]>
                    </td>

                </tr>

                        </table>
                        <![endif]-->
                    </td>
                </tr>
                </tbody>
            </table>
            </div>
            <!--[if mso | IE]>
                </td>
                </tr>
            </table>

            <table
                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
            >
                <tr>
                <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
            <![endif]-->
            <div style="margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tbody>
                <tr>
                    <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                    <!--[if mso | IE]>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">

                <tr>

                    <td
                    class="" style="vertical-align:top;width:600px;"
                    >
                <![endif]-->
                    <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tbody><tr>
                            <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                            <div style="font-family:Muli, Arial, sans-serif;font-size:14px;font-weight:400;line-height:20px;text-align:center;color:#333333;">© ProFoodShots, contact@profoodshots.com</div>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                            <div style="font-family:Muli, Arial, sans-serif;font-size:14px;font-weight:400;line-height:20px;text-align:center;color:#333333;">You may <a href="https://profoodshots.com" style="color: #2e58ff; text-decoration: none;"> unsubscribe </a>from all future emails.</div>
                            </td>
                        </tr>
                        </tbody></table>
                    </div>
                    <!--[if mso | IE]>
                    </td>

                </tr>

                        </table>
                        <![endif]-->
                    </td>
                </tr>
                </tbody>
            </table>
            </div>
            <!--[if mso | IE]>
                </td>
                </tr>
            </table>

            <table
                align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600"
            >
                <tr>
                <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
            <![endif]-->
            <div style="margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;">
                <tbody>
                <tr>
                    <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                    <!--[if mso | IE]>
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">

                <tr>

                    <td
                    class="" style="vertical-align:top;width:600px;"
                    >
                <![endif]-->
                    <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                        <tbody><tr>
                            <td style="font-size:0px;word-break:break-word;">
                            <!--[if mso | IE]>

                <table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td height="1" style="vertical-align:top;height:1px;">

            <![endif]-->
                            <div style="height:1px;">   </div>
                            <!--[if mso | IE]>

                </td></tr></table>

            <![endif]-->
                            </td>
                        </tr>
                        </tbody></table>
                    </div>
                    <!--[if mso | IE]>
                    </td>

                </tr>

                        </table>
                        <![endif]-->
                    </td>
                </tr>
                </tbody>
            </table>
            </div>
            <!--[if mso | IE]>
                </td>
                </tr>
            </table>
            <![endif]-->
        </div>


        </body></html>`;

    }

    sendOrderEmail(recipient,orderid,ordername)
    {
        console.log('Sending order received email...');
        const htmlText =this.getHtmlTemplate('',[`${ordername} is being processed!`,`You'll receive an email once your photos are ready`,'',`Thanks for your order!<br><small>Order #${orderid}</small>`]);
        this.sendEmail(recipient,'We are generating your AI-enhanced food photos!',htmlText);
        //Notify (real customer)
       
    }


    sendGalleryEmail(recipient,orderLink,orderid,ordername)
    {
        console.log('Sending gallery ready email');
        const htmlText =this.getHtmlTemplate(orderLink,[`Get ready to see the AI magic!`,`To view the gallery for "${ordername}" please visit the following link`,'View gallery',`We hope you enjoy your photos!<br><small>Order #${orderid}</small>`]);
        this.sendEmail(recipient,'Your AI-enhanced food photos are ready!',htmlText);
    }

    sendDownloadEmail(recipient,downloadLink,customername,sessionid)
    {
        console.log('Sending download email');
        if(!customername)
            customername='';
        const htmlText =this.getHtmlTemplate(downloadLink,[`Hi ${customername}!`,`To download your photos visit the following link`,'Donwload photos',`Thanks for your purchase!`]);
        this.sendEmail(recipient,'Download your pruchased AI pro food photos!',htmlText);
    }

    async sendEmail(recipient,subject,htmlText)
    {
        try{   
            if(!this.API_KEY)
                throw new Error('No API key configured!');

            console.log('Sending email');
            const mailerSend = new MailerSend({
                apiKey: this.API_KEY,
            });
    
            const sentFrom = new Sender("contact@profoodshots.com", "ProFoodShots");
    
            const recipients = [
            new Recipient(recipient, "Your AI Pro order")
            ];
    
            const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject(subject)
            .setHtml(htmlText);
    
            await mailerSend.email.send(emailParams);
            } catch(err)
            {
                console.log('Error ',err)
            }
        }
        catch(err)
        {
            console.log('Error sending email');
        }

}

module.exports = Mailer;


