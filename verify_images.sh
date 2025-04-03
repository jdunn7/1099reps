#!/bin/bash
# Script to verify and fix image issues for 1099 REPS blog

echo "Verifying images for 1099 REPS blog..."

# Check if images directory exists and is accessible
if [ ! -d "images" ]; then
  echo "Error: images directory not found!"
  exit 1
fi

# Check permissions on images directory
echo "Setting proper permissions on image directories..."
chmod -R 755 images

# Verify each required image exists and has proper permissions
echo "Verifying individual images..."

# Define arrays of required images
BLOG_IMAGES=(
  "images/logo.png"
  "images/blog/featured-article.jpg"
  "images/blog/featured-article2.jpg"
  "images/blog/featured-article3.jpg"
  "images/blog/article-1.jpg"
  "images/blog/article-2.jpg"
  "images/blog/article-3.jpg"
  "images/blog/article-4.jpg"
  "images/blog/article-5.jpg"
  "images/blog/article-6.jpg"
  "images/blog/article-7.jpg"
  "images/blog/editors-pick-1.jpg"
)

TEAM_IMAGES=(
  "images/team/sarah-johnson.jpg"
  "images/team/michael-chen.jpg"
  "images/team/jennifer-patel.jpg"
  "images/team/david-rodriguez.jpg"
  "images/team/lisa-wong.jpg"
  "images/team/john-smith.jpg"
)

# Check blog images
for img in "${BLOG_IMAGES[@]}"; do
  if [ -f "$img" ]; then
    echo "✓ $img exists"
    chmod 644 "$img"
  else
    echo "✗ $img is missing - downloading placeholder"
    mkdir -p "$(dirname "$img")"
    
    # Get filename without path
    filename=$(basename "$img")
    
    # Create appropriate placeholder based on filename
    case "$filename" in
      "logo.png")
        curl -s -o "$img" "https://via.placeholder.com/200x50/0056b3/ffffff?text=1099+REPS"
        ;;
      "featured-article.jpg"|"featured-article2.jpg"|"featured-article3.jpg")
        curl -s -o "$img" "https://via.placeholder.com/1200x600/007bff/ffffff?text=Featured+Article"
        ;;
      *)
        curl -s -o "$img" "https://via.placeholder.com/800x500/2196f3/ffffff?text=Blog+Article"
        ;;
    esac
    
    echo "  Downloaded placeholder for $img"
  fi
done

# Check team images
for img in "${TEAM_IMAGES[@]}"; do
  if [ -f "$img" ]; then
    echo "✓ $img exists"
    chmod 644 "$img"
  else
    echo "✗ $img is missing - downloading placeholder"
    mkdir -p "$(dirname "$img")"
    
    # Get initials from filename
    filename=$(basename "$img")
    name=${filename%.jpg}
    initials=$(echo "$name" | sed -E 's/^([a-z])[a-z]*-([a-z])[a-z]*/\1\2/i')
    
    curl -s -o "$img" "https://via.placeholder.com/300x300/3f51b5/ffffff?text=${initials^^}"
    echo "  Downloaded placeholder for $img"
  fi
done

echo "Verifying image paths in HTML..."
# Check if there are any image paths in HTML that don't match actual files
grep -r "img src=\"" --include="*.html" . | while read -r line; do
  # Extract the file path and image path
  file=$(echo "$line" | cut -d: -f1)
  img_path=$(echo "$line" | grep -o 'img src="[^"]*"' | sed 's/img src="\([^"]*\)"/\1/')
  
  # Skip external URLs
  if [[ "$img_path" == http* ]]; then
    continue
  fi
  
  # Convert relative path to absolute path based on the HTML file location
  file_dir=$(dirname "$file")
  if [[ "$img_path" == /* ]]; then
    # Absolute path from project root
    abs_img_path=".$img_path"
  elif [[ "$img_path" == ../* ]]; then
    # Relative path going up
    abs_img_path=$(realpath --relative-to="." "$file_dir/$img_path")
  else
    # Relative path in same directory
    abs_img_path="$file_dir/$img_path"
  fi
  
  # Check if the image exists
  if [ ! -f "$abs_img_path" ]; then
    echo "✗ Missing image: $abs_img_path referenced in $file"
    
    # Create directory if needed
    mkdir -p "$(dirname "$abs_img_path")"
    
    # Download a placeholder
    curl -s -o "$abs_img_path" "https://via.placeholder.com/800x400/cccccc/333333?text=Image+Not+Found"
    echo "  Downloaded placeholder for $abs_img_path"
  fi
done

echo "All images verified and fixed if needed!"
echo "Please refresh your browser to see the updated images."
