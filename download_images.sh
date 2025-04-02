#!/bin/bash

# Create directories if they don't exist
mkdir -p images/blog
mkdir -p images/team

# Download blog images
curl -o images/blog/featured-article.jpg https://source.unsplash.com/random/1200x600/?medical,sales
curl -o images/blog/featured-article2.jpg https://source.unsplash.com/random/1200x600/?healthcare
curl -o images/blog/featured-article3.jpg https://source.unsplash.com/random/1200x600/?finance,tax
curl -o images/blog/article-1.jpg https://source.unsplash.com/random/800x500/?negotiation,contract
curl -o images/blog/article-2.jpg https://source.unsplash.com/random/800x500/?medical,device
curl -o images/blog/article-3.jpg https://source.unsplash.com/random/800x500/?tax,finance
curl -o images/blog/article-4.jpg https://source.unsplash.com/random/800x500/?success,career
curl -o images/blog/article-5.jpg https://source.unsplash.com/random/800x500/?personal,brand
curl -o images/blog/article-6.jpg https://source.unsplash.com/random/800x500/?pharmaceutical,regulation
curl -o images/blog/article-7.jpg https://source.unsplash.com/random/800x500/?medical,technology
curl -o images/blog/editors-pick-1.jpg https://source.unsplash.com/random/800x500/?employment

# Download team member images
curl -o images/team/sarah-johnson.jpg https://source.unsplash.com/random/300x300/?woman,professional
curl -o images/team/michael-chen.jpg https://source.unsplash.com/random/300x300/?man,asian,professional
curl -o images/team/jennifer-patel.jpg https://source.unsplash.com/random/300x300/?woman,indian,professional
curl -o images/team/david-rodriguez.jpg https://source.unsplash.com/random/300x300/?man,hispanic,professional
curl -o images/team/lisa-wong.jpg https://source.unsplash.com/random/300x300/?woman,asian,professional
curl -o images/team/john-smith.jpg https://source.unsplash.com/random/300x300/?man,professional

# Download logo if it doesn't exist
if [ ! -f images/logo.png ]; then
  curl -o images/logo.png https://via.placeholder.com/200x50/0056b3/ffffff?text=1099+REPS
fi

echo "All images have been downloaded successfully!"
