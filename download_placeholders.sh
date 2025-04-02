#!/bin/bash
# Script to download placeholder images for 1099 REPS blog
# This ensures there are no broken images on the site

echo "Downloading placeholder images for 1099 REPS blog..."

# Create directories if they don't exist
mkdir -p images/blog
mkdir -p images/team

# Download logo
echo "Downloading logo..."
curl -s -o images/logo.png "https://via.placeholder.com/200x50/0056b3/ffffff?text=1099+REPS"

# Download featured article images
echo "Downloading featured article images..."
curl -s -o images/blog/featured-article.jpg "https://via.placeholder.com/1200x600/007bff/ffffff?text=Top+10+Tips+for+1099+Reps"
curl -s -o images/blog/featured-article2.jpg "https://via.placeholder.com/1200x600/17a2b8/ffffff?text=Healthcare+Landscape"
curl -s -o images/blog/featured-article3.jpg "https://via.placeholder.com/1200x600/28a745/ffffff?text=Tax+Strategies"

# Download blog article images
echo "Downloading blog article images..."
curl -s -o images/blog/article-1.jpg "https://via.placeholder.com/800x500/2196f3/ffffff?text=Negotiate+Better+Contracts"
curl -s -o images/blog/article-2.jpg "https://via.placeholder.com/800x500/ff9800/ffffff?text=Medical+Device+Sales"
curl -s -o images/blog/article-3.jpg "https://via.placeholder.com/800x500/4caf50/ffffff?text=Tax+Planning"
curl -s -o images/blog/article-4.jpg "https://via.placeholder.com/800x500/f44336/ffffff?text=Success+Story"
curl -s -o images/blog/article-5.jpg "https://via.placeholder.com/800x500/9c27b0/ffffff?text=Personal+Brand"
curl -s -o images/blog/article-6.jpg "https://via.placeholder.com/800x500/ff5722/ffffff?text=Regulatory+Changes"
curl -s -o images/blog/article-7.jpg "https://via.placeholder.com/800x500/009688/ffffff?text=Future+of+Sales"

# Download team member images
echo "Downloading team member images..."
curl -s -o images/team/sarah-johnson.jpg "https://via.placeholder.com/300x300/e91e63/ffffff?text=SJ"
curl -s -o images/team/michael-chen.jpg "https://via.placeholder.com/300x300/3f51b5/ffffff?text=MC"
curl -s -o images/team/jennifer-patel.jpg "https://via.placeholder.com/300x300/673ab7/ffffff?text=JP"
curl -s -o images/team/david-rodriguez.jpg "https://via.placeholder.com/300x300/ffc107/000000?text=DR"
curl -s -o images/team/lisa-wong.jpg "https://via.placeholder.com/300x300/8bc34a/000000?text=LW"
curl -s -o images/team/john-smith.jpg "https://via.placeholder.com/300x300/607d8b/ffffff?text=JS"

echo "All placeholder images downloaded successfully!"
echo "Your blog should now display all images correctly."
