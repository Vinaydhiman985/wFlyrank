import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import { z } from 'zod';

const BASE_URL = 'https://books.toscrape.com/catalogue/';
const START_URL = `${BASE_URL}page-1.html`;
const CACHE_DIR = path.resolve('cache');
const OUTPUT_DIR = path.resolve('output');

const HEADERS = {
    'User-Agent': 'FlyRankInternshipA9/1.0 (+https://github.com/your-username/your-repo)'
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const BookSchema = z.object({
    title: z.string().min(1, "Title is required"),
    product_url: z.string().url("Must be a valid absolute URL"),
    price_text: z.string().min(1, "Price text is required"),
    price_gbp: z.number().positive("Price must be a positive number"),
    availability_text: z.string().min(1, "Availability is required"),
    rating_text: z.string().nullable(),
    description: z.string().nullable(),
    source_page: z.string().url("Source page must be a valid URL"),
    fetched_at: z.string().datetime("Must be a valid ISO datetime string")
});

async function fetchWithCache(url, cacheFileName, metrics) {
    const cacheFile = path.join(CACHE_DIR, cacheFileName);
    await fs.mkdir(CACHE_DIR, { recursive: true });

    try {
        await fs.access(cacheFile);
        metrics.cacheHits++;
        return await fs.readFile(cacheFile, 'utf-8');
    } catch {
        metrics.pagesFetched++;
        console.log(`FETCH: Requesting ${url}`);
        
        let attempts = 0;
        const maxAttempts = 2; // Try once, retry once on 5xx/timeout

        while (attempts < maxAttempts) {
            attempts++;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            try {
                const response = await fetch(url, { headers: HEADERS, signal: controller.signal });
                clearTimeout(timeoutId);

                // Do not retry 4xx errors (like 404 or 403)
                if (response.status === 404 || response.status === 403) {
                    throw new Error(`Client error status: ${response.status} (No retry)`);
                }

                if (!response.ok) {
                    throw new Error(`Server error status: ${response.status}`);
                }

                const htmlContent = await response.text();
                await fs.writeFile(cacheFile, htmlContent, 'utf-8');
                await sleep(500);
                return htmlContent;

            } catch (error) {
                clearTimeout(timeoutId);
                if (attempts >= maxAttempts || error.message.includes('No retry')) {
                    throw error;
                }
                console.log(`Retrying ${url} (Attempt ${attempts + 1})...`);
                await sleep(1000);
            }
        }
    }
}

async function scrapePipeline() {
    const startTime = new Date();
    const metrics = {
        pagesFetched: 0,
        cacheHits: 0,
        failedPages: 0
    };

    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    let currentUrl = START_URL;
    let cataloguePagesCount = 0;
    const bookToSourceMap = new Map();

    // --- STAGE 2: Discover URLs ---
    while (currentUrl && cataloguePagesCount < 3) {
        cataloguePagesCount++;
        const pageFileName = `catalogue-page-${cataloguePagesCount}.html`;
        
        try {
            const html = await fetchWithCache(currentUrl, pageFileName, metrics);
            const $ = cheerio.load(html);

            $('h3 a').each((_, element) => {
                const href = $(element).attr('href');
                const absoluteUrl = new URL(href, currentUrl).href;
                if (!bookToSourceMap.has(absoluteUrl)) {
                    bookToSourceMap.set(absoluteUrl, currentUrl);
                }
            });

            const nextBtn = $('li.next a');
            if (nextBtn.length > 0) {
                currentUrl = new URL(nextBtn.attr('href'), currentUrl).href;
            } else {
                currentUrl = null;
            }
        } catch (err) {
            console.error(`Failed to fetch catalogue page ${currentUrl}: ${err.message}`);
            metrics.failedPages++;
            break;
        }
    }

    // --- STAGE 5 TEST: Injecting one fake/broken URL on purpose ---
    bookToSourceMap.set(
        "https://books.toscrape.com/catalogue/this-book-does-not-exist_9999/index.html",
        START_URL
    );

    // --- STAGE 3 & 5: Extract Raw Records with Fault Tolerance ---
    const rawRecords = [];
    let index = 0;

    for (const [productUrl, sourcePage] of bookToSourceMap.entries()) {
        index++;
        const slug = productUrl.split('/').slice(-2)[0] || `book-${index}`;
        const bookCacheFile = `book-${index}-${slug}.html`;

        try {
            const bookHtml = await fetchWithCache(productUrl, bookCacheFile, metrics);
            const $ = cheerio.load(bookHtml);

            const title = $('.product_main h1').text().trim();
            const price_text = $('.product_main .price_color').text().trim();
            const availability_text = $('.product_main .availability').text().trim();
            
            const starClass = $('.product_main .star-rating').attr('class') || '';
            const rating_text = starClass.replace('star-rating', '').trim() || null;

            const descEl = $('#product_description').next('p');
            const description = descEl.length > 0 ? descEl.text().trim() : null;

            rawRecords.push({
                title,
                product_url: productUrl,
                price_text,
                availability_text,
                rating_text,
                description,
                source_page: sourcePage,
                fetched_at: new Date().toISOString()
            });
        } catch (err) {
            console.warn(`[SKIPPED & LOGGED] Failed to process book at ${productUrl}: ${err.message}`);
            metrics.failedPages++;
        }
    }

    // --- STAGE 4: Clean, Validate & Store ---
    const validRecordsMap = new Map();
    const errorRecords = [];

    for (const raw of rawRecords) {
        const numericPrice = parseFloat(raw.price_text.replace(/[^0-9.]/g, ''));
        const normalizedRecord = {
            ...raw,
            price_gbp: isNaN(numericPrice) ? 0 : numericPrice
        };

        const result = BookSchema.safeParse(normalizedRecord);
        if (result.success) {
            validRecordsMap.set(result.data.product_url, result.data);
        } else {
            errorRecords.push({ record: raw, errors: result.error.format() });
        }
    }

    const finalBooks = Array.from(validRecordsMap.values());

    await fs.writeFile(
        path.join(OUTPUT_DIR, 'books.json'),
        JSON.stringify(finalBooks, null, 2),
        'utf-8'
    );

    if (errorRecords.length > 0) {
        await fs.writeFile(
            path.join(OUTPUT_DIR, 'errors.json'),
            JSON.stringify(errorRecords, null, 2),
            'utf-8'
        );
    }

    // --- STAGE 5: Generate Run Report ---
    const endTime = new Date();
    const durationMs = endTime - startTime;

    const runReport = {
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_seconds: (durationMs / 1000).toFixed(2),
        catalogue_pages_visited: cataloguePagesCount,
        pages_fetched: metrics.pagesFetched,
        cache_hits: metrics.cacheHits,
        valid_records: finalBooks.length,
        invalid_records: errorRecords.length,
        failed_pages: metrics.failedPages
    };

    await fs.writeFile(
        path.join(OUTPUT_DIR, 'run-report.json'),
        JSON.stringify(runReport, null, 2),
        'utf-8'
    );

    console.log(`\n--- STAGE 5 CHECKPOINT RESULTS ---`);
    console.log(JSON.stringify(runReport, null, 2));
}

scrapePipeline();