const puppeteer = require('puppeteer');
const fs = require('fs');
const proxyChain = require('proxy-chain');

/**
 * @param {string} inputElem it will contain the incoming input data of the RAM size
 * @returns refined RAM data
 */
function cleaningRamArray(inputElem) {
    // Extracting the part before `GB`
    let inputString = inputElem;
    let extractedItem = inputString.match(/(.+?)\sGB/);
    try {
        if (extractedItem && extractedItem.length > 1) {
            extractedItem = extractedItem[1];
        }
    } catch (error) {
        return error
    }
    return extractedItem;
}

/**
 * Main function of the program
 */
async function mainFunction() {
    try {
        // HTTP proxy to be used
        const httpProxyServer = 'http://3badbe1ae1%3Buk%3Bsession_21242750:4be0028afb@datacenter.proxyempire.io:9000/';
        // const httpProxyServer = 'http://3badbe1ae1;es;session_10692059:4be0028afb@datacenter.proxyempire.io:9000';
        // const httpProxyServer = 'http://3badbe1ae1;any:4be0028afb@datacenter.proxyempire.io:9000';

        // Converting the http proxy to the puppeteer required format
        const newProxyUrl = await proxyChain.anonymizeProxy(httpProxyServer);
        // console.log(newProxyUrl);
        // Browser parametrs on the start of program

        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            // Using proxy
            args: [`--proxy-server=${newProxyUrl}`],
        });

        // Allow to open website on new page
        const page = await browser.newPage();
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

        // Applying first filter
        try {
            // 0) Desired RAM option
            let desiredRam = '32';
            // 1) Targeted the RAM filter.
            await page.waitForSelector('#x-refine__group_1__0');
            // 2) Got all possible values of RAM avilable along with the items.
            await new Promise(resolve => setTimeout(resolve, 3000));
            const ramOptions = await page.$$eval('#x-refine__group_1__0 .cbx .x-refine__multi-select-cbx', options => options.map(option => option.innerText));
            // 3) Click of the button.
            for (let index = 0; index < ramOptions.length; index++) {
                if (await cleaningRamArray(ramOptions[index]) === desiredRam) {
                    // Desired button to target
                    await page.waitForSelector(`[aria-label="${desiredRam} GB"]`);
                    await page.click(`[aria-label="${desiredRam} GB"]`);
                    break;
                }
            }
        } catch (error) {
            console.log(error);
        }

        // Scraping the data
        const listOfProducts = [];
        for (let currentPage = 0; currentPage < 5; currentPage++) {
            // Doing page scroll for pagination and record fetching
            await page.evaluate(() => {
                window.scrollBy(0, window.innerHeight);
            });
            // Targeting the products on the page
            await page.waitForSelector('.s-item');
            await new Promise(resolve => setTimeout(resolve, 3000));
            const products = await page.$$('.s-item');
            for (let product of products) {
                // Title and image of the product.
                let title = null;
                let imageUrl = null;
                let price = null;
                try {
                    // Extract title from each product element
                    title = await product.$eval('.s-item__title', el => el.textContent.trim());
                } catch (error) {
                    console.log(error);
                }
                // Extract image URL from each product
                try {
                    imageUrl = await page.evaluate(el => el.querySelector('img').src, product);
                } catch (error) {
                    console.log(error);
                }
                // Extract price from each product class="s-item__price"
                try {
                    // Extract title from each product element
                    price = await product.$eval('.s-item__price', el => el.textContent.trim());
                } catch (error) {
                    console.log(error);
                }
                // Values fetched should not be null.
                if (title !== 'Shop on eBay') {
                    // Adding it to the array
                    await listOfProducts.push({ title, imageUrl, price });
                }
            }

            // Pagination part
            if (currentPage !== 4) {
                await page.waitForSelector('.pagination__next');
                await new Promise(resolve => setTimeout(resolve, 3000));
                await page.click('.pagination__next');
            }


        }
        console.log('Total records fetched : ' + listOfProducts.length);
        // console.log(listOfProducts);
        const jsonData = JSON.stringify(listOfProducts);
        fs.writeFile('static_proxy_result.json', jsonData, 'utf8', (error) => {
            if (error) {
                console.log(error);
            }
            console.log('Data written successfully');
        })

        // Close the browser
        await browser.close();
    } catch (error) {
        console.log(error);
    }
}

// Calling main function
mainFunction();