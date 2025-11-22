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
    """Generate all logo sizes from cropped source"""

    # Crop the whitespace first
    print("Cropping whitespace from logo...")
    cropped = crop_whitespace(source_path, padding=20)

    # Save cropped master
    master_path = os.path.join(output_dir, "logo-master-cropped.jpg")
    cropped.save(master_path, "JPEG", quality=95)
    print(f"Saved cropped master: {cropped.size}")

    # Define all sizes needed
    sizes = {
        # Favicons (square, need to fit logo nicely)
        "favicon-16.jpg": (16, 16),
        "favicon-32.jpg": (32, 32),
        "favicon-192.jpg": (192, 192),
        "favicon-512.jpg": (512, 512),

        # Social media profile pictures (square)
        "instagram-320.jpg": (320, 320),
        "twitter-400.jpg": (400, 400),
        "linkedin-400.jpg": (400, 400),

        # Banners (wide)
        "twitter-header-1500x500.jpg": (1500, 500),
        "linkedin-banner-1584x396.jpg": (1584, 396),

        # Ad formats
        "ad-square-1080.jpg": (1080, 1080),
        "ad-landscape-1200x628.jpg": (1200, 628),
        "ad-story-1080x1920.jpg": (1080, 1920),

        # Other
        "og-image-1200x630.jpg": (1200, 630),
        "email-200x70.jpg": (200, 70),
        "navbar-160x50.jpg": (160, 50),
    }

    for filename, size in sizes.items():
        output_path = os.path.join(output_dir, filename)

        # Create a white background canvas
        canvas = Image.new('RGB', size, (255, 255, 255))

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

        canvas.paste(resized, (x, y))

        # Save with appropriate quality
        quality = 95 if size[0] >= 400 else 90
        canvas.save(output_path, "JPEG", quality=quality)
        print(f"Generated {filename}: {size}")

    print("\nAll logo sizes generated successfully!")

if __name__ == "__main__":
    source = r"C:\Users\fatih\Desktop\Travel Quote Bot\public\logo-assets\TQB_Logo.png"
    output_dir = r"C:\Users\fatih\Desktop\Travel Quote Bot\public\logo-assets"

    generate_logo_sizes(source, output_dir)
