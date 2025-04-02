# 1099 REPS Blog Image Tools

This directory contains tools to help you download and manage images for your blog. These tools use popular image APIs like Pixabay, Pexels, and Unsplash to find high-quality, royalty-free images for your website.

## Available Tools

### 1. Node.js Image Downloader (`download-api-images.js`)

This script downloads images directly to your project directories using Node.js.

#### Requirements
- Node.js installed on your system
- API key from one of the supported providers

#### Usage

```bash
node download-api-images.js --api=pixabay --key=YOUR_API_KEY --category=all
```

#### Options
- `--api`: API provider (pixabay, pexels, or unsplash)
- `--key`: Your API key
- `--category`: Image category to download (featured, blog, team, or all)

#### Example

```bash
# Download all images using Pixabay API
node download-api-images.js --api=pixabay --key=YOUR_PIXABAY_API_KEY --category=all

# Download only team member images using Pexels API
node download-api-images.js --api=pexels --key=YOUR_PEXELS_API_KEY --category=team
```

### 2. Browser-based Image Fetcher (`image-fetcher.html`)

This is a web-based tool that allows you to download images through your browser.

#### Usage

1. Open `image-fetcher.html` in your web browser
2. Select your preferred API provider
3. Enter your API key
4. Click on one of the image category buttons to start downloading
5. Move the downloaded images to the appropriate project directories

## Getting API Keys

### Pixabay
1. Go to [Pixabay API Documentation](https://pixabay.com/api/docs/)
2. Create an account or sign in
3. Request an API key

### Pexels
1. Go to [Pexels API](https://www.pexels.com/api/)
2. Create an account or sign in
3. Request an API key

### Unsplash
1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create an account or sign in
3. Create a new application
4. Get your API key (client ID)

## Image Directory Structure

The downloaded images will be saved to the following directories:

- Featured article images: `images/blog/featured-article1.jpg`, `featured-article2.jpg`, etc.
- Blog article images: `images/blog/article-1.jpg`, `article-2.jpg`, etc.
- Team member images: `images/team/sarah-johnson.jpg`, `michael-chen.jpg`, etc.

## Tips for Using Images

1. **Always use high-quality images**: Choose images that are clear, professional, and relevant to your content.
2. **Optimize images for web**: Compress images to reduce file size without sacrificing quality.
3. **Use consistent image dimensions**: Maintain consistent aspect ratios for similar types of images.
4. **Add alt text**: Always include descriptive alt text for accessibility.
5. **Consider responsive images**: Use the `srcset` attribute for different screen sizes.

## Legal Considerations

- Always check the license terms of the images you download
- Pixabay, Pexels, and Unsplash offer royalty-free images, but specific terms may apply
- Some images may require attribution depending on the source and license
