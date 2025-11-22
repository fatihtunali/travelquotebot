from PIL import Image, ImageOps
import os

def crop_whitespace(image_path, padding=10, threshold=240):
    """Crop whitespace from image and add minimal padding"""
    img = Image.open(image_path)

    # Convert to RGB if necessary
    if img.mode in ('RGBA', 'LA'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'RGBA':
            background.paste(img, mask=img.split()[3])
        else:
            background.paste(img, mask=img.split()[1])
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    # Convert to grayscale for better detection
    gray = img.convert('L')

    # Find pixels that are darker than threshold (actual content)
    pixels = gray.load()
    width, height = gray.size

    # Find bounds of non-white content
    left = width
    top = height
    right = 0
    bottom = 0

    for y in range(height):
        for x in range(width):
            if pixels[x, y] < threshold:  # Found content pixel
                if x < left:
                    left = x
                if x > right:
                    right = x
                if y < top:
                    top = y
                if y > bottom:
                    bottom = y

    if right > left and bottom > top:
        # Add padding around the content
        left = max(0, left - padding)
        top = max(0, top - padding)
        right = min(width, right + padding)
        bottom = min(height, bottom + padding)

        cropped = img.crop((left, top, right, bottom))
        return cropped

    return img

def generate_logo_sizes(source_path, output_dir):
    """Generate all logo sizes from source with transparency - no cropping"""

    # Load the original PNG with transparency
    print("Loading logo with transparency...")
    img = Image.open(source_path)

    # Ensure it has an alpha channel
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Light crop with generous padding to preserve size
    cropped = crop_whitespace_transparent(img, padding=50)
    print(f"Cropped size: {cropped.size}")

    # Define all sizes needed - now using PNG for transparency
    sizes = {
        # Favicons (square, need to fit logo nicely)
        "favicon-16.png": (16, 16),
        "favicon-32.png": (32, 32),
        "favicon-192.png": (192, 192),
        "favicon-512.png": (512, 512),

        # Social media profile pictures (square)
        "instagram-320.png": (320, 320),
        "twitter-400.png": (400, 400),
        "linkedin-400.png": (400, 400),

        # Banners (wide)
        "twitter-header-1500x500.png": (1500, 500),
        "linkedin-banner-1584x396.png": (1584, 396),

        # Ad formats
        "ad-square-1080.png": (1080, 1080),
        "ad-landscape-1200x628.png": (1200, 628),
        "ad-story-1080x1920.png": (1080, 1920),

        # Other
        "og-image-1200x630.png": (1200, 630),
        "email-200x70.png": (200, 70),
        "navbar-160x50.png": (160, 50),
    }

    for filename, size in sizes.items():
        output_path = os.path.join(output_dir, filename)

        # Create a transparent canvas
        canvas = Image.new('RGBA', size, (0, 0, 0, 0))

        # Calculate how to fit the logo
        img_ratio = cropped.width / cropped.height
        canvas_ratio = size[0] / size[1]

        # Use 95% of available space for better visibility
        fill_ratio = 0.95

        if img_ratio > canvas_ratio:
            # Logo is wider than canvas ratio - fit by width
            new_width = int(size[0] * fill_ratio)
            new_height = int(new_width / img_ratio)
        else:
            # Logo is taller than canvas ratio - fit by height
            new_height = int(size[1] * fill_ratio)
            new_width = int(new_height * img_ratio)

        # Resize the logo
        resized = cropped.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # Center on canvas
        x = (size[0] - new_width) // 2
        y = (size[1] - new_height) // 2

        canvas.paste(resized, (x, y), resized)

        # Save as PNG to preserve transparency
        canvas.save(output_path, "PNG")
        print(f"Generated {filename}: {size}")

    print("\nAll logo sizes generated successfully!")

def crop_whitespace_transparent(img, padding=10):
    """Crop whitespace from RGBA image while preserving transparency"""

    # Get alpha channel to find content bounds
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # Get the bounding box of non-transparent content
    bbox = img.getbbox()

    if bbox:
        # Add padding around the content
        left = max(0, bbox[0] - padding)
        top = max(0, bbox[1] - padding)
        right = min(img.width, bbox[2] + padding)
        bottom = min(img.height, bbox[3] + padding)

        cropped = img.crop((left, top, right, bottom))
        return cropped

    return img

if __name__ == "__main__":
    source = r"C:\Users\fatih\Desktop\Travel Quote Bot\public\logo-assets\TQB_Logo.png"
    output_dir = r"C:\Users\fatih\Desktop\Travel Quote Bot\public\logo-assets"

    generate_logo_sizes(source, output_dir)
