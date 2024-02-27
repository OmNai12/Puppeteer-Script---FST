const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');

/**
 * Main function of the program
 */
async function mainFunction() {
    try {
        // HTTP proxy to be used
        // const httpProxyServer = 'http://3badbe1ae1%3Buk%3Bsession_21242750:4be0028afb@datacenter.proxyempire.io:9000/';
        const httpProxyServer = 'http://3badbe1ae1;es;session_10692059:4be0028afb@datacenter.proxyempire.io:9000';
        // const httpProxyServer = 'http://3badbe1ae1;any:4be0028afb@datacenter.proxyempire.io:9000';

        // Converting the http proxy to the puppeteer required format
        const newProxyUrl = await proxyChain.anonymizeProxy(httpProxyServer);

        // Browser parametrs on the start of program
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            // Using proxy
            args: [`--proxy-server=${newProxyUrl}`],
        });

        // Allow to open website on new page
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(60000); // 60 seconds
        // Goto the website of ebay
        await page.goto('https://wormhole.app/');

        try {
            // 1) Click on the button to upload file
            await page.waitForSelector('.css-qy91p5');
            await page.click('.css-qy91p5');
            await page.waitForSelector('.css-1rufx9q');
            await page.click('.css-1rufx9q');
        } catch (error) {
            console.log(error);
        }

        // Windows copy path :- C:\Users\omnay\Downloads
        // Required example :- C:/Users/Username/Documents/images/test_to_upload.jpg
        // C:/Users/omnay/Downloads/test_to_upload.jpg
        let fileToUpload = 'C:/Users/omnay/Downloads/test_to_upload.jpg';

        // Close the browser
        // await browser.close();
    } catch (error) {
        console.log(error);
    }
}

// Calling main function
mainFunction();