/**
 * Image Fetcher Utility
 * This script fetches images from Pixabay API and downloads them to the specified directories
 */

// Configuration
const config = {
    // Replace with your actual API key
    pixabayApiKey: 'WTS_3tFf07LAtGyGzR9Fi2u082_EKWGAGlB3KMrlfzc',
    
    // Image categories and search terms
    imageCategories: {
        featured: ['medical sales', 'healthcare professional', 'business meeting'],
        blog: [
            { id: 'article-1', query: 'contract negotiation', alt: 'How to Negotiate Better Contracts as an Independent Sales Rep' },
            { id: 'article-2', query: 'medical device technology', alt: 'The Future of Medical Device Sales: Trends for 2025' },
            { id: 'article-3', query: 'tax planning finance', alt: 'Tax Planning Strategies for Independent Contractors' },
            { id: 'article-4', query: 'career success', alt: 'From Hospital Rep to Six-Figure Earner: A Success Story' },
            { id: 'article-5', query: 'personal branding', alt: 'Building Your Personal Brand as a Medical Sales Representative' },
            { id: 'article-6', query: 'pharmaceutical regulation', alt: 'Navigating Regulatory Changes in Pharmaceutical Sales' },
            { id: 'article-7', query: 'medical sales technology', alt: 'The Future of Medical Device Sales in 2025' }
        ],
        team: [
            { id: 'sarah-johnson', query: 'woman professional portrait', alt: 'Sarah Johnson' },
            { id: 'michael-chen', query: 'asian man professional', alt: 'Michael Chen' },
            { id: 'jennifer-patel', query: 'indian woman professional', alt: 'Jennifer Patel' },
            { id: 'david-rodriguez', query: 'hispanic man professional', alt: 'David Rodriguez' },
            { id: 'lisa-wong', query: 'asian woman professional', alt: 'Lisa Wong' },
            { id: 'john-smith', query: 'man professional portrait', alt: 'John Smith' }
        ]
    }
};

/**
 * Fetch images from Pixabay API
 * @param {string} query - Search query
 * @param {number} perPage - Number of results to return
 * @returns {Promise<Array>} - Array of image objects
 */
async function fetchPixabayImages(query, perPage = 3) {
    const url = `https://pixabay.com/api/?key=${config.pixabayApiKey}&q=${encodeURIComponent(query)}&image_type=photo&per_page=${perPage}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.hits;
    } catch (error) {
        console.error('Error fetching images from Pixabay:', error);
        return [];
    }
}

/**
 * Download an image and save it to the specified path
 * @param {string} imageUrl - URL of the image to download
 * @param {string} filePath - Path where the image will be saved
 */
async function downloadImage(imageUrl, filePath) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        // Create a link element and trigger download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filePath.split('/').pop();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log(`Downloaded: ${filePath}`);
    } catch (error) {
        console.error(`Error downloading image to ${filePath}:`, error);
    }
}

/**
 * Fetch and download featured images
 */
async function fetchFeaturedImages() {
    for (let i = 0; i < config.imageCategories.featured.length; i++) {
        const query = config.imageCategories.featured[i];
        const images = await fetchPixabayImages(query, 1);
        
        if (images.length > 0) {
            const image = images[0];
            await downloadImage(image.largeImageURL, `../images/blog/featured-article${i + 1}.jpg`);
        }
    }
}

/**
 * Fetch and download blog article images
 */
async function fetchBlogImages() {
    for (const article of config.imageCategories.blog) {
        const images = await fetchPixabayImages(article.query, 1);
        
        if (images.length > 0) {
            const image = images[0];
            await downloadImage(image.largeImageURL, `../images/blog/${article.id}.jpg`);
        }
    }
}

/**
 * Fetch and download team member images
 */
async function fetchTeamImages() {
    for (const member of config.imageCategories.team) {
        const images = await fetchPixabayImages(member.query, 1);
        
        if (images.length > 0) {
            const image = images[0];
            await downloadImage(image.largeImageURL, `../images/team/${member.id}.jpg`);
        }
    }
}

/**
 * Initialize the image fetcher
 */
async function initImageFetcher() {
    console.log('Starting image fetcher...');
    
    // Create a simple UI
    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.maxWidth = '600px';
    container.style.margin = '0 auto';
    container.style.fontFamily = 'Arial, sans-serif';
    
    const title = document.createElement('h1');
    title.textContent = '1099 REPS Image Fetcher';
    container.appendChild(title);
    
    const description = document.createElement('p');
    description.textContent = 'This utility will download images from Pixabay API for your blog.';
    container.appendChild(description);
    
    // Create buttons for each category
    const categories = [
        { name: 'Featured Images', func: fetchFeaturedImages },
        { name: 'Blog Article Images', func: fetchBlogImages },
        { name: 'Team Member Images', func: fetchTeamImages }
    ];
    
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = `Download ${category.name}`;
        button.style.display = 'block';
        button.style.margin = '10px 0';
        button.style.padding = '10px 15px';
        button.style.backgroundColor = '#007bff';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        
        button.addEventListener('click', async () => {
            button.disabled = true;
            button.textContent = `Downloading ${category.name}...`;
            
            await category.func();
            
            button.textContent = `${category.name} Downloaded!`;
            button.style.backgroundColor = '#28a745';
            setTimeout(() => {
                button.disabled = false;
                button.textContent = `Download ${category.name}`;
                button.style.backgroundColor = '#007bff';
            }, 3000);
        });
        
        container.appendChild(button);
    });
    
    // Add note about API key
    const note = document.createElement('p');
    note.style.marginTop = '20px';
    note.style.fontSize = '14px';
    note.style.color = '#6c757d';
    note.textContent = 'Note: Make sure to replace the API key in the configuration with your actual Pixabay API key.';
    container.appendChild(note);
    
    document.body.appendChild(container);
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initImageFetcher);
