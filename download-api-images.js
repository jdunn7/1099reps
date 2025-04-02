/**
 * Image Downloader for 1099 REPS Blog
 * 
 * This script downloads images from Pixabay, Pexels, or Unsplash APIs
 * and saves them to the appropriate directories in your project.
 * 
 * Usage:
 * node download-api-images.js --api=pixabay --key=YOUR_API_KEY --category=all
 * 
 * Options:
 * --api: API provider (pixabay, pexels, or unsplash)
 * --key: Your API key
 * --category: Image category to download (featured, blog, team, or all)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

// Parse command line arguments
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace(/^--/, '')] = value;
  return acc;
}, {});

// Configuration
const config = {
  // API configurations
  apis: {
    pixabay: {
      baseUrl: 'https://pixabay.com/api/',
      keyParam: 'key',
      queryParam: 'q',
      resultsPath: 'hits',
      imageUrlPath: 'largeImageURL'
    },
    pexels: {
      baseUrl: 'https://api.pexels.com/v1/search',
      keyParam: 'Authorization',
      queryParam: 'query',
      resultsPath: 'photos',
      imageUrlPath: 'src.original'
    },
    unsplash: {
      baseUrl: 'https://api.unsplash.com/search/photos',
      keyParam: 'client_id',
      queryParam: 'query',
      resultsPath: 'results',
      imageUrlPath: 'urls.full'
    }
  },
  
  // Image categories and search terms
  imageCategories: {
    featured: [
      { query: 'medical sales', path: 'images/blog/featured-article1.jpg' },
      { query: 'healthcare professional', path: 'images/blog/featured-article2.jpg' },
      { query: 'business meeting', path: 'images/blog/featured-article3.jpg' }
    ],
    blog: [
      { query: 'contract negotiation', path: 'images/blog/article-1.jpg' },
      { query: 'medical device technology', path: 'images/blog/article-2.jpg' },
      { query: 'tax planning finance', path: 'images/blog/article-3.jpg' },
      { query: 'career success', path: 'images/blog/article-4.jpg' },
      { query: 'personal branding', path: 'images/blog/article-5.jpg' },
      { query: 'pharmaceutical regulation', path: 'images/blog/article-6.jpg' },
      { query: 'medical sales technology', path: 'images/blog/article-7.jpg' }
    ],
    team: [
      { query: 'woman professional portrait', path: 'images/team/sarah-johnson.jpg' },
      { query: 'asian man professional', path: 'images/team/michael-chen.jpg' },
      { query: 'indian woman professional', path: 'images/team/jennifer-patel.jpg' },
      { query: 'hispanic man professional', path: 'images/team/david-rodriguez.jpg' },
      { query: 'asian woman professional', path: 'images/team/lisa-wong.jpg' },
      { query: 'man professional portrait', path: 'images/team/john-smith.jpg' }
    ]
  }
};

// Validate arguments
const apiProvider = args.api || 'pixabay';
const apiKey = args.key;
const category = args.category || 'all';

if (!apiKey) {
  console.error('Error: API key is required');
  console.log('Usage: node download-api-images.js --api=pixabay --key=YOUR_API_KEY --category=all');
  process.exit(1);
}

if (!config.apis[apiProvider]) {
  console.error(`Error: Unsupported API provider: ${apiProvider}`);
  console.log('Supported providers: pixabay, pexels, unsplash');
  process.exit(1);
}

// Create directories if they don't exist
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExists(dirname);
  fs.mkdirSync(dirname);
}

// Download an image from a URL and save it to a file
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    ensureDirectoryExists(filePath);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Fetch images from API
async function fetchImages(apiProvider, apiKey, query) {
  return new Promise((resolve, reject) => {
    const apiConfig = config.apis[apiProvider];
    
    // Build request URL and headers
    const url = new URL(apiConfig.baseUrl);
    let headers = {};
    
    if (apiProvider === 'pexels') {
      headers[apiConfig.keyParam] = apiKey;
      url.searchParams.append(apiConfig.queryParam, query);
      url.searchParams.append('per_page', '1');
    } else {
      url.searchParams.append(apiConfig.keyParam, apiKey);
      url.searchParams.append(apiConfig.queryParam, query);
      url.searchParams.append('per_page', '1');
    }
    
    // Make request
    const req = https.request(url, { headers }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`API responded with status ${res.statusCode}`));
          return;
        }
        
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (err) {
          reject(new Error('Failed to parse API response'));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

// Process a category of images
async function processCategory(categoryName) {
  const apiConfig = config.apis[apiProvider];
  const images = config.imageCategories[categoryName];
  
  console.log(`\n=== Processing ${categoryName} images ===`);
  
  for (const image of images) {
    try {
      console.log(`Searching for "${image.query}"...`);
      
      const data = await fetchImages(apiProvider, apiKey, image.query);
      
      // Get results based on API structure
      let results = data;
      apiConfig.resultsPath.split('.').forEach(path => {
        results = results[path];
      });
      
      if (!results || results.length === 0) {
        console.log(`No results found for "${image.query}"`);
        continue;
      }
      
      // Get image URL based on API structure
      let imageUrl = results[0];
      apiConfig.imageUrlPath.split('.').forEach(path => {
        imageUrl = imageUrl[path];
      });
      
      // Download image
      console.log(`Downloading ${image.path}...`);
      await downloadImage(imageUrl, image.path);
      console.log(`✓ Downloaded ${image.path}`);
    } catch (error) {
      console.error(`Error processing ${image.query}: ${error.message}`);
    }
  }
}

// Main function
async function main() {
  console.log(`Image Downloader for 1099 REPS Blog`);
  console.log(`API Provider: ${apiProvider}`);
  console.log(`Category: ${category}`);
  
  try {
    if (category === 'all') {
      await processCategory('featured');
      await processCategory('blog');
      await processCategory('team');
    } else if (config.imageCategories[category]) {
      await processCategory(category);
    } else {
      console.error(`Error: Unknown category: ${category}`);
      console.log('Available categories: featured, blog, team, all');
      process.exit(1);
    }
    
    console.log('\nDownload completed successfully!');
  } catch (error) {
    console.error(`\nError: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
