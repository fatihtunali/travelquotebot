from PIL import Image, ImageDraw, ImageFont
import os

# Paths
pptx_path = r"C:\Users\fatih\Desktop\Travel Quote Bot\workspace\TravelQuoteBot-Overview.pptx"
output_path = r"C:\Users\fatih\Desktop\Travel Quote Bot\workspace\TravelQuoteBot-AllSlides.png"
font_dir = r"C:\Users\fatih\.claude\plugins\marketplaces\anthropic-agent-skills\canvas-design\canvas-fonts"

# Grid settings
cols = 3
rows = 4  # 11 slides + 1 empty = 12 cells (3x4)
slide_width = 480
slide_height = 270  # 16:9 aspect ratio
padding = 20
margin = 40

# Calculate total image size
total_width = cols * slide_width + (cols - 1) * padding + 2 * margin
total_height = rows * slide_height + (rows - 1) * padding + 2 * margin + 80  # Extra for title

# Colors
TEAL_DARK = (39, 120, 132)
TEAL_LIGHT = (94, 168, 167)
WHITE = (255, 255, 255)
GRAY_LIGHT = (248, 249, 250)
GRAY_TEXT = (102, 102, 102)

def load_font(name, size):
    try:
        font_map = {
            'bold': 'BricolageGrotesque-Bold.ttf',
            'regular': 'WorkSans-Regular.ttf',
        }
        return ImageFont.truetype(os.path.join(font_dir, font_map[name]), size)
    except:
        return ImageFont.load_default()

# Slide titles (from our presentation)
slide_titles = [
    "1. Title",
    "2. The Problem",
    "3. Our Solution",
    "4. Who Uses It",
    "5. Customer Journey",
    "6. How AI Works",
    "7. Pricing System",
    "8. Dashboard Features",
    "9. Booking Pipeline",
    "10. Benefits",
    "11. Call to Action"
]

# Slide colors (backgrounds we used)
slide_colors = [
    TEAL_DARK,      # Title
    GRAY_LIGHT,     # Problem
    WHITE,          # Solution
    GRAY_LIGHT,     # Who Uses
    TEAL_DARK,      # Journey
    WHITE,          # AI
    GRAY_LIGHT,     # Pricing
    WHITE,          # Dashboard
    TEAL_DARK,      # Pipeline
    GRAY_LIGHT,     # Benefits
    TEAL_DARK,      # CTA
]

def create_slide_preview(draw, x, y, width, height, title, bg_color, index):
    """Create a preview thumbnail for a slide"""
    # Background
    draw.rectangle([x, y, x + width, y + height], fill=bg_color)

    # Border
    draw.rectangle([x, y, x + width, y + height], outline=TEAL_LIGHT, width=2)

    # Slide number/title
    font = load_font('regular', 12)
    text_color = WHITE if bg_color == TEAL_DARK else GRAY_TEXT

    # Center the title
    bbox = draw.textbbox((0, 0), title, font=font)
    text_width = bbox[2] - bbox[0]
    text_x = x + (width - text_width) // 2
    text_y = y + height // 2 - 8

    draw.text((text_x, text_y), title, fill=text_color, font=font)

def create_grid():
    # Create image
    img = Image.new('RGB', (total_width, total_height), WHITE)
    draw = ImageDraw.Draw(img)

    # Title
    font_title = load_font('bold', 32)
    title = "Travel Quote Bot - Presentation Overview"
    bbox = draw.textbbox((0, 0), title, font=font_title)
    text_width = bbox[2] - bbox[0]
    draw.text(((total_width - text_width) // 2, 25), title, fill=TEAL_DARK, font=font_title)

    # Draw each slide preview
    for i in range(len(slide_titles)):
        row = i // cols
        col = i % cols

        x = margin + col * (slide_width + padding)
        y = margin + 60 + row * (slide_height + padding)  # 60 for title space

        create_slide_preview(draw, x, y, slide_width, slide_height,
                           slide_titles[i], slide_colors[i], i)

    # Save
    img.save(output_path, 'PNG', optimize=True)
    print(f"Grid saved to: {output_path}")

if __name__ == "__main__":
    create_grid()
