const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');

/**
 * Main function of the program
 */
async function mainFunction() {
    try {
        // HTTP proxy to be used
        const httpProxyServer = 'http://3badbe1ae1;es;session_10692059:4be0028afb@datacenter.proxyempire.io:9000';
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
        await page.goto('https://www.ebay.com/');

        // Input search query.
        try {
            // 1) Declare product to search
            let searchProduct = 'laptop';
            // 2) Search the input query with the targeted input-box
            await new Promise(resolve => setTimeout(resolve, 3000));
            await page.type('#gh-ac', searchProduct);
            // 3) Click on the button to search
            await new Promise(resolve => setTimeout(resolve, 2000));
            await page.click('#gh-btn');
        } catch (error) {
            console.log(error);
        }

        // Close the browser
        // await browser.close();
    } catch (error) {
        console.log(error);
    }
}

// Calling main function
mainFunction();