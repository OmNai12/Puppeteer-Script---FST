const puppeteer = require('puppeteer');
const fs = require('fs');

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
 * 
 * @param {string} inputElem it will contain the incoming input data of the screen size
 * @returns refined screen size
 */
function cleaningScreenSizeArray(inputElem) {
    // Extracting the part of screen size
    let extractedScreenSize = "";
    for (let index = 0; index < inputElem.length; index++) {
        if (inputElem[index] === ' ') {
            return extractedScreenSize + ' in';
        }
        extractedScreenSize += inputElem[index];
    }
    return extractedScreenSize;
}

/**
 * Main function of the program
 */
async function mainFunction() {
    try {
        // Browser parametrs on the start of program
        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
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
            await page.type('#gh-ac', searchProduct);
            // 3) Click on the button to search
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

        // Applying secound filter
        try {
            // Desired screen size
            let desiredScreenSize = '14-14.9 in';
            // 1) Targeted the brand filter.
            await page.waitForSelector('#x-refine__group_1__1');
            // 2) Got all possible values of RAM avilable along with the items.
            const screenOption = await page.$$eval('#x-refine__group_1__1 .cbx .x-refine__multi-select-cbx', options => options.map(option => option.innerText));
            // 3) Click of the button.
            for (let index = 0; index < screenOption.length; index++) {
                // console.log(cleaningScreenSizeArray(screenOption[index]));
                if (cleaningScreenSizeArray(screenOption[index]) === desiredScreenSize) {
                    // Desired button to target
                    await page.waitForSelector(`[aria-label="${desiredScreenSize}"]`);
                    await page.click(`[aria-label="${desiredScreenSize}"]`);
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
            await page.waitForSelector('.pagination__next');
            await page.click('.pagination__next');


        }
        console.log(listOfProducts.length);
        // console.log(listOfProducts);
        const jsonData = JSON.stringify(listOfProducts);
        fs.writeFile('result.json', jsonData, 'utf8', (error) => {
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