const { CheerioCrawler, Dataset, log } = require('crawlee');

const START_URLS = [
    'https://beatbot.com/products/',
    'https://beatbot.com/news/',
    'https://beatbot.com/',
];

const crawler = new CheerioCrawler({
    requestHandler: async ({ request, $, enqueueLinks }) => {
        log.info(`Scraping: ${request.url}`);

        const isProduct = request.url.includes('/products/');
        const isNews = request.url.includes('/news/');

        if (isProduct || isNews) {
            const title = $('h1').first().text().trim();
            const description = $('meta[name="description"]').attr('content') || $('p').first().text().trim();
            const imageUrls = [];

            $('img').each((_, el) => {
                const src = $(el).attr('src');
                if (src && !src.startsWith('data:')) {
                    imageUrls.push(src.startsWith('http') ? src : new URL(src, request.url).href);
                }
            });

            const price = $('[class*="price"], .price').first().text().trim();

            await Dataset.pushData({
                url: request.url,
                title,
                description,
                price: price || null,
                images: imageUrls,
                pageType: isProduct ? 'product' : 'news',
                scrapedAt: new Date().toISOString(),
            });
        }

        // Découvre d'autres pages à scraper sur le même domaine
        await enqueueLinks({
            globs: ['https://beatbot.com/**'],
            exclude: ['https://beatbot.com/#*'],
        });
    },
});

crawler.run(START_URLS);
