# Books to Scrape Scraper

## Target Classification

- Target: https://books.toscrape.com
- Purpose: Practice sandbox for learning web scraping ethics and pipelines.
- Scope: Restricted strictly to the first 3 catalogue pages (60 books total).
- Robots check result: I opened https://books.toscrape.com/robots.txt and received a 404 response, so that path is not available on the site.
- Mandatory sentence: "I will not reuse this code on another site without checking its rules and terms first."

## Lane & Installation

This project uses the Node.js lane.

### Dependencies

```bash
npm install
```

Dependencies used in this project:
- `cheerio`
- `zod`

## Run

```bash
node src/index.js
```

## Record Schema

The scraper validates each extracted book using a Zod schema. The key fields are:

- `title`
- `product_url`
- `price_text`
- `price_gbp`
- `availability_text`
- `rating_text`
- `description`
- `source_page`
- `fetched_at`

## Politeness Rules Followed

- Custom User-Agent: `FlyRankInternshipA9/1.0 (+https://github.com/your-username/your-repo)`
- 500ms delay between requests to avoid hammering the site
- 5 second timeout per request
- Local caching in `cache/catalogue-page-1.html` and per-book cache files
- Strict `200 OK` check before saving data

## Real Run Report

This is the exact `run-report.json` produced by the scraper during the verified run:

```json
{
  "start_time": "2026-09-10T15:34:12.019Z",
  "end_time": "2026-09-10T15:34:14.892Z",
  "duration_seconds": "2.87",
  "catalogue_pages_visited": 3,
  "pages_fetched": 1,
  "cache_hits": 63,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 1
}
```

## Browser Cost Comparison Note

This assignment did not require a browser because the server already sends the relevant book data in static HTML, so using Playwright or a browser engine would only add unnecessary memory and CPU overhead for the same scraped content.

## Ethics Note

I will always check the target site's rules first, prefer official APIs when available, and never bypass logins or paywalls.

## Final Git Check

Before pushing, make sure the following are ignored and not committed:

```bash
git status --short --ignored
```

Expected ignored items:
- `node_modules/`
- `cache/`
- `output/`
- `.DS_Store`
