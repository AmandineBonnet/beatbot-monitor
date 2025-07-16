const { CheerioCrawler } = require('crawlee');

const crawler = new CheerioCrawler({
    requestHandler: async ({ request, $ }) => {
        const title = $('title').text();
        console.log(`Titre de ${request.url} : ${title}`);
    },
});

crawler.run(['https://beatbot.com/']);
