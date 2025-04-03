#!/bin/bash
# Script to fix blog images for 1099 REPS

echo "Fixing blog images..."

# Create directories if they don't exist
mkdir -p images/blog
mkdir -p images/team

# Download blog images with descriptive names
echo "Downloading blog article images..."
curl -s -o images/blog/featured-article.jpg "https://source.unsplash.com/random/1200x600/?medical,sales"
curl -s -o images/blog/featured-article2.jpg "https://source.unsplash.com/random/1200x600/?healthcare"
curl -s -o images/blog/featured-article3.jpg "https://source.unsplash.com/random/1200x600/?finance,tax"

curl -s -o images/blog/article-1.jpg "https://source.unsplash.com/random/800x500/?contract,negotiation"
curl -s -o images/blog/article-2.jpg "https://source.unsplash.com/random/800x500/?medical,device"
curl -s -o images/blog/article-3.jpg "https://source.unsplash.com/random/800x500/?tax,finance"
curl -s -o images/blog/article-4.jpg "https://source.unsplash.com/random/800x500/?success,career"
curl -s -o images/blog/article-5.jpg "https://source.unsplash.com/random/800x500/?personal,branding"
curl -s -o images/blog/article-6.jpg "https://source.unsplash.com/random/800x500/?pharmaceutical,regulation"
curl -s -o images/blog/article-7.jpg "https://source.unsplash.com/random/800x500/?technology,medical"
curl -s -o images/blog/editors-pick-1.jpg "https://source.unsplash.com/random/400x300/?editor,choice"

# Download team member images
echo "Downloading team member images..."
curl -s -o images/team/sarah-johnson.jpg "https://randomuser.me/api/portraits/women/23.jpg"
curl -s -o images/team/michael-chen.jpg "https://randomuser.me/api/portraits/men/34.jpg"
curl -s -o images/team/jennifer-patel.jpg "https://randomuser.me/api/portraits/women/65.jpg"
curl -s -o images/team/david-rodriguez.jpg "https://randomuser.me/api/portraits/men/45.jpg"
curl -s -o images/team/lisa-wong.jpg "https://randomuser.me/api/portraits/women/54.jpg"
curl -s -o images/team/john-smith.jpg "https://randomuser.me/api/portraits/men/22.jpg"

# Set proper permissions
echo "Setting proper permissions..."
chmod -R 755 images
find images -type f -exec chmod 644 {} \;

echo "All blog images have been downloaded and permissions set."
echo "Please refresh your browser to see the updated images."
