#!/usr/bin/env python3
"""
Placeholder Image Generator for 1099 REPS Blog

This script generates placeholder images for the blog to ensure no broken images.
It creates colored rectangles with text labels for each required image.
"""

import os
from PIL import Image, ImageDraw, ImageFont
import random

# Define image paths and metadata
IMAGES = [
    # Logo
    {
        "path": "images/logo.png",
        "size": (200, 50),
        "bg_color": (0, 86, 179),  # #0056b3
        "text": "1099 REPS",
        "text_color": (255, 255, 255),
    },
    
    # Featured articles
    {
        "path": "images/blog/featured-article.jpg",
        "size": (1200, 600),
        "bg_color": (0, 123, 255),  # #007bff
        "text": "Top 10 Tips for 1099 Medical Sales Representatives",
        "text_color": (255, 255, 255),
    },
    {
        "path": "images/blog/featured-article2.jpg",
        "size": (1200, 600),
        "bg_color": (23, 162, 184),  # #17a2b8
        "text": "How to Navigate the Changing Healthcare Landscape",
        "text_color": (255, 255, 255),
    },
    {
        "path": "images/blog/featured-article3.jpg",
        "size": (1200, 600),
        "bg_color": (40, 167, 69),  # #28a745
        "text": "Tax Strategies Every Independent Contractor Should Know",
        "text_color": (255, 255, 255),
    },
    
    # Blog articles
    {
        "path": "images/blog/article-1.jpg",
        "size": (800, 500),
        "bg_color": (33, 150, 243),  # #2196f3
        "text": "How to Negotiate Better Contracts",
        "text_color": (255, 255, 255),
    },
    {
        "path": "images/blog/article-2.jpg",
        "size": (800, 500),
        "bg_color": (255, 152, 0),  # #ff9800
        "text": "The Future of Medical Device Sales",
        "text_color": (255, 255, 255),
    },
    {
        "path": "images/blog/article-3.jpg",
        "size": (800, 500),
        "bg_color": (76, 175, 80),  # #4caf50
        "text": "Tax Planning Strategies",
        "text_color": (255, 255, 255),
    },
    {
        "path": "images/blog/article-4.jpg",
        "size": (800, 500),
        "bg_color": (244, 67, 54),  # #f44336
        "text": "From Hospital Rep to Six-Figure Earner",
        "text_color": (255, 255, 255),
    },
    {
        "path": "images/blog/article-5.jpg",
        "size": (800, 500),
        "bg_color": (156, 39, 176),  # #9c27b0
        "text": "Building Your Personal Brand",
        "text_color": (255, 255, 255),
    },
    {
        "path": "images/blog/article-6.jpg",
        "size": (800, 500),
        "bg_color": (255, 87, 34),  # #ff5722
        "text": "Navigating Regulatory Changes",
        "text_color": (255, 255, 255),
    },
    {
        "path": "images/blog/article-7.jpg",
        "size": (800, 500),
        "bg_color": (0, 150, 136),  # #009688
        "text": "The Future of Medical Device Sales in 2025",
        "text_color": (255, 255, 255),
    },
    
    # Team members
    {
        "path": "images/team/sarah-johnson.jpg",
        "size": (300, 300),
        "bg_color": (233, 30, 99),  # #e91e63
        "text": "Sarah Johnson",
        "text_color": (255, 255, 255),
        "is_avatar": True,
    },
    {
        "path": "images/team/michael-chen.jpg",
        "size": (300, 300),
        "bg_color": (63, 81, 181),  # #3f51b5
        "text": "Michael Chen",
        "text_color": (255, 255, 255),
        "is_avatar": True,
    },
    {
        "path": "images/team/jennifer-patel.jpg",
        "size": (300, 300),
        "bg_color": (103, 58, 183),  # #673ab7
        "text": "Jennifer Patel",
        "text_color": (255, 255, 255),
        "is_avatar": True,
    },
    {
        "path": "images/team/david-rodriguez.jpg",
        "size": (300, 300),
        "bg_color": (255, 193, 7),  # #ffc107
        "text": "David Rodriguez",
        "text_color": (0, 0, 0),
        "is_avatar": True,
    },
    {
        "path": "images/team/lisa-wong.jpg",
        "size": (300, 300),
        "bg_color": (139, 195, 74),  # #8bc34a
        "text": "Lisa Wong",
        "text_color": (0, 0, 0),
        "is_avatar": True,
    },
    {
        "path": "images/team/john-smith.jpg",
        "size": (300, 300),
        "bg_color": (96, 125, 139),  # #607d8b
        "text": "John Smith",
        "text_color": (255, 255, 255),
        "is_avatar": True,
    },
]

def ensure_dir(file_path):
    """Make sure the directory exists for a file path"""
    directory = os.path.dirname(file_path)
    if not os.path.exists(directory):
        os.makedirs(directory)

def generate_placeholder(image_info):
    """Generate a placeholder image based on the provided info"""
    path = image_info["path"]
    size = image_info["size"]
    bg_color = image_info["bg_color"]
    text = image_info["text"]
    text_color = image_info["text_color"]
    is_avatar = image_info.get("is_avatar", False)
    
    # Create the image
    img = Image.new('RGB', size, color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Try to load a font, fall back to default if not available
    try:
        # Adjust font size based on image size
        font_size = min(size[0], size[1]) // 10
        font = ImageFont.truetype("Arial", font_size)
    except IOError:
        font = ImageFont.load_default()
    
    # Draw text
    if is_avatar:
        # For avatars, draw initials in a circle
        initials = "".join([name[0].upper() for name in text.split() if name])
        text_width, text_height = draw.textsize(initials, font=font)
        position = ((size[0] - text_width) // 2, (size[1] - text_height) // 2)
        
        # Draw circle
        circle_radius = min(size[0], size[1]) // 2 - 10
        circle_position = (size[0] // 2, size[1] // 2)
        draw.ellipse(
            (
                circle_position[0] - circle_radius,
                circle_position[1] - circle_radius,
                circle_position[0] + circle_radius,
                circle_position[1] + circle_radius
            ),
            fill=bg_color,
            outline=(255, 255, 255)
        )
        
        # Draw initials
        draw.text(position, initials, fill=text_color, font=font)
    else:
        # For regular images, wrap text to fit width
        lines = []
        words = text.split()
        current_line = words[0]
        
        for word in words[1:]:
            test_line = current_line + " " + word
            test_width, _ = draw.textsize(test_line, font=font)
            
            if test_width <= size[0] - 40:  # 20px padding on each side
                current_line = test_line
            else:
                lines.append(current_line)
                current_line = word
        
        lines.append(current_line)
        
        # Calculate total text height
        line_height = draw.textsize("A", font=font)[1] + 10
        total_text_height = len(lines) * line_height
        
        # Draw each line
        y_position = (size[1] - total_text_height) // 2
        for line in lines:
            text_width, _ = draw.textsize(line, font=font)
            x_position = (size[0] - text_width) // 2
            draw.text((x_position, y_position), line, fill=text_color, font=font)
            y_position += line_height
    
    # Save the image
    ensure_dir(path)
    img.save(path)
    print(f"Generated: {path}")

def main():
    """Main function to generate all placeholder images"""
    print("Generating placeholder images for 1099 REPS blog...")
    
    for image_info in IMAGES:
        generate_placeholder(image_info)
    
    print("All placeholder images generated successfully!")

if __name__ == "__main__":
    main()
