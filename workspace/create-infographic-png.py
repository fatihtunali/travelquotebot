from PIL import Image, ImageDraw, ImageFont
import os

# Colors (RGB)
TEAL_DARK = (39, 120, 132)
TEAL_LIGHT = (94, 168, 167)
CORAL = (254, 68, 71)
WHITE = (255, 255, 255)
GRAY_LIGHT = (248, 249, 250)
GRAY_TEXT = (102, 102, 102)
GRAY_DARK = (51, 51, 51)

# Font paths
font_dir = r"C:\Users\fatih\.claude\plugins\marketplaces\anthropic-agent-skills\canvas-design\canvas-fonts"

# Image dimensions (A3 at 150 DPI for web - good balance of quality and file size)
width = 1754
height = 2480
output_path = r"C:\Users\fatih\Desktop\Travel Quote Bot\public\images\infographic.png"

def load_font(name, size):
    """Load a font with fallback"""
    try:
        font_map = {
            'bold': 'BricolageGrotesque-Bold.ttf',
            'regular': 'BricolageGrotesque-Regular.ttf',
            'work': 'WorkSans-Regular.ttf',
            'work-bold': 'WorkSans-Bold.ttf',
            'mono': 'DMMono-Regular.ttf'
        }
        return ImageFont.truetype(os.path.join(font_dir, font_map[name]), size)
    except:
        return ImageFont.load_default()

def draw_rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    """Draw a rounded rectangle"""
    x1, y1, x2, y2 = xy

    if fill:
        # Main rectangle
        draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill)
        draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill)
        # Corners
        draw.pieslice([x1, y1, x1 + 2*radius, y1 + 2*radius], 180, 270, fill=fill)
        draw.pieslice([x2 - 2*radius, y1, x2, y1 + 2*radius], 270, 360, fill=fill)
        draw.pieslice([x1, y2 - 2*radius, x1 + 2*radius, y2], 90, 180, fill=fill)
        draw.pieslice([x2 - 2*radius, y2 - 2*radius, x2, y2], 0, 90, fill=fill)

    if outline:
        # Outline
        draw.arc([x1, y1, x1 + 2*radius, y1 + 2*radius], 180, 270, fill=outline, width=width)
        draw.arc([x2 - 2*radius, y1, x2, y1 + 2*radius], 270, 360, fill=outline, width=width)
        draw.arc([x1, y2 - 2*radius, x1 + 2*radius, y2], 90, 180, fill=outline, width=width)
        draw.arc([x2 - 2*radius, y2 - 2*radius, x2, y2], 0, 90, fill=outline, width=width)
        draw.line([x1 + radius, y1, x2 - radius, y1], fill=outline, width=width)
        draw.line([x1 + radius, y2, x2 - radius, y2], fill=outline, width=width)
        draw.line([x1, y1 + radius, x1, y2 - radius], fill=outline, width=width)
        draw.line([x2, y1 + radius, x2, y2 - radius], fill=outline, width=width)

def text_center(draw, text, font, y, color, width):
    """Draw centered text"""
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    x = (width - text_width) // 2
    draw.text((x, y), text, fill=color, font=font)

def create_infographic():
    # Create image
    img = Image.new('RGB', (width, height), WHITE)
    draw = ImageDraw.Draw(img)

    # Load fonts
    font_title = load_font('bold', 56)
    font_subtitle = load_font('work', 24)
    font_section = load_font('bold', 28)
    font_body = load_font('work', 18)
    font_body_bold = load_font('work-bold', 20)
    font_small = load_font('work', 14)
    font_stat = load_font('mono', 36)
    font_stat_large = load_font('mono', 48)
    font_check = load_font('work-bold', 20)

    margin = 60
    content_width = width - 2 * margin

    # Header
    header_height = 160
    draw.rectangle([0, 0, width, header_height], fill=TEAL_DARK)

    draw.text((margin, 50), "Travel Quote Bot", fill=WHITE, font=font_title)
    draw.text((margin, 110), "AI-Powered Travel Quotes in Minutes, Not Hours", fill=TEAL_LIGHT, font=font_subtitle)

    y = header_height + 50

    # Section 1: The Problem
    draw.text((margin, y), "THE PROBLEM", fill=GRAY_DARK, font=font_section)
    y += 40

    # Problem box
    box_height = 90
    draw_rounded_rect(draw, [margin, y, width - margin, y + box_height], 12, fill=CORAL)
    draw.text((margin + 30, y + 20), "Tour operators spend 2-4 HOURS creating each quote manually", fill=WHITE, font=font_body_bold)
    draw.text((margin + 30, y + 50), "Spreadsheets, pricing lookups, error-prone calculations, inconsistent formatting", fill=WHITE, font=font_small)
    y += box_height + 30

    # Problem stats
    stats = [("2-4 hrs", "Per quote"), ("100+", "Price checks"), ("High", "Error risk")]
    stat_width = content_width // 3

    for i, (number, label) in enumerate(stats):
        stat_x = margin + i * stat_width

        # Stat box
        draw_rounded_rect(draw, [stat_x + 8, y, stat_x + stat_width - 8, y + 70], 8, fill=GRAY_LIGHT)

        # Left border accent
        draw.rectangle([stat_x + 8, y, stat_x + 14, y + 70], fill=TEAL_DARK)

        # Number
        bbox = draw.textbbox((0, 0), number, font=font_stat)
        text_w = bbox[2] - bbox[0]
        draw.text((stat_x + stat_width//2 - text_w//2, y + 10), number, fill=TEAL_DARK, font=font_stat)

        # Label
        bbox = draw.textbbox((0, 0), label, font=font_small)
        text_w = bbox[2] - bbox[0]
        draw.text((stat_x + stat_width//2 - text_w//2, y + 48), label, fill=GRAY_TEXT, font=font_small)

    y += 100

    # Section 2: The Solution
    draw.text((margin, y), "THE SOLUTION", fill=GRAY_DARK, font=font_section)
    y += 40

    # Solution box
    draw_rounded_rect(draw, [margin, y, width - margin, y + 90], 12, fill=TEAL_LIGHT)
    draw.text((margin + 30, y + 20), "AI generates complete itineraries with real-time pricing", fill=WHITE, font=font_body_bold)
    draw.text((margin + 30, y + 50), "Day-by-day plans, hotel selections, tours, transfers, meals - all automatically priced", fill=WHITE, font=font_small)
    y += 120

    # Section 3: How It Works
    draw.text((margin, y), "HOW IT WORKS", fill=GRAY_DARK, font=font_section)
    y += 45

    # Journey steps
    steps = [("1", "SELECT", "Destinations, dates,", "preferences"),
             ("2", "GENERATE", "AI creates full", "itinerary"),
             ("3", "PREVIEW", "Review pricing", "& details"),
             ("4", "BOOK", "Send to", "customer")]

    step_width = content_width // 4
    step_height = 110

    for i, (num, title, desc1, desc2) in enumerate(steps):
        step_x = margin + i * step_width

        # Step box
        draw_rounded_rect(draw, [step_x + 8, y, step_x + step_width - 8, y + step_height], 8, outline=TEAL_LIGHT, width=3)

        # Number circle
        circle_x = step_x + step_width // 2
        circle_y = y + 22
        draw.ellipse([circle_x - 16, circle_y - 16, circle_x + 16, circle_y + 16], fill=CORAL)

        # Number text
        bbox = draw.textbbox((0, 0), num, font=font_body_bold)
        text_w = bbox[2] - bbox[0]
        draw.text((circle_x - text_w//2, circle_y - 10), num, fill=WHITE, font=font_body_bold)

        # Title
        bbox = draw.textbbox((0, 0), title, font=font_body_bold)
        text_w = bbox[2] - bbox[0]
        draw.text((step_x + step_width//2 - text_w//2, y + 45), title, fill=TEAL_DARK, font=font_body_bold)

        # Description
        bbox = draw.textbbox((0, 0), desc1, font=font_small)
        text_w = bbox[2] - bbox[0]
        draw.text((step_x + step_width//2 - text_w//2, y + 70), desc1, fill=GRAY_TEXT, font=font_small)

        bbox = draw.textbbox((0, 0), desc2, font=font_small)
        text_w = bbox[2] - bbox[0]
        draw.text((step_x + step_width//2 - text_w//2, y + 88), desc2, fill=GRAY_TEXT, font=font_small)

        # Arrow
        if i < 3:
            arrow_x = step_x + step_width - 8
            draw.polygon([(arrow_x, y + step_height//2 - 6),
                         (arrow_x + 12, y + step_height//2),
                         (arrow_x, y + step_height//2 + 6)], fill=TEAL_LIGHT)

    y += step_height + 35

    # Section 4: What AI Creates
    draw.text((margin, y), "WHAT AI CREATES", fill=GRAY_DARK, font=font_section)
    y += 40

    # AI output items
    ai_outputs = ["Day-by-day narrative", "Hotel selections", "Tours & activities",
                  "Transportation", "Meal plans", "Pricing breakdown"]

    output_width = content_width // 3
    output_height = 50

    for i, item in enumerate(ai_outputs):
        row = i // 3
        col = i % 3
        item_x = margin + col * output_width
        item_y = y + row * (output_height + 10)

        draw_rounded_rect(draw, [item_x + 5, item_y, item_x + output_width - 5, item_y + output_height], 6, fill=GRAY_LIGHT)

        # Check mark
        draw.text((item_x + 18, item_y + 12), "✓", fill=TEAL_LIGHT, font=font_check)
        draw.text((item_x + 45, item_y + 14), item, fill=GRAY_DARK, font=font_body)

    y += 2 * (output_height + 10) + 30

    # Section 5: Pricing Categories
    draw.text((margin, y), "8 PRICING CATEGORIES", fill=GRAY_DARK, font=font_section)
    y += 40

    categories = ["Hotels", "Tours", "Vehicles", "Transfers", "Guides", "Entrance Fees", "Meals", "Extras"]
    cat_width = content_width // 4
    cat_height = 45

    for i, cat in enumerate(categories):
        row = i // 4
        col = i % 4
        cat_x = margin + col * cat_width
        cat_y = y + row * (cat_height + 10)

        draw_rounded_rect(draw, [cat_x + 5, cat_y, cat_x + cat_width - 5, cat_y + cat_height], 6, fill=WHITE)
        draw.rectangle([cat_x + 5, cat_y + cat_height - 4, cat_x + cat_width - 5, cat_y + cat_height], fill=TEAL_LIGHT)

        bbox = draw.textbbox((0, 0), cat, font=font_body)
        text_w = bbox[2] - bbox[0]
        draw.text((cat_x + cat_width//2 - text_w//2, cat_y + 12), cat, fill=TEAL_DARK, font=font_body)

    y += 2 * (cat_height + 10) + 15

    # Note
    note = "All pricing is seasonal - AI automatically selects correct prices based on travel dates"
    bbox = draw.textbbox((0, 0), note, font=font_small)
    text_w = bbox[2] - bbox[0]
    draw.text((width//2 - text_w//2, y), note, fill=GRAY_TEXT, font=font_small)
    y += 40

    # Section 6: Benefits
    draw.text((margin, y), "THE BENEFITS", fill=GRAY_DARK, font=font_section)
    y += 45

    benefits = [("90%", "Time Saved", "Minutes instead of hours"),
                ("0", "Errors", "Automatic calculations"),
                ("100%", "Professional", "Beautiful proposals")]

    benefit_width = content_width // 3
    benefit_height = 120

    for i, (metric, title, desc) in enumerate(benefits):
        benefit_x = margin + i * benefit_width

        draw_rounded_rect(draw, [benefit_x + 8, y, benefit_x + benefit_width - 8, y + benefit_height], 8, fill=WHITE)

        # Top accent
        draw.rectangle([benefit_x + 8, y, benefit_x + benefit_width - 8, y + 6], fill=CORAL)

        # Metric
        bbox = draw.textbbox((0, 0), metric, font=font_stat_large)
        text_w = bbox[2] - bbox[0]
        draw.text((benefit_x + benefit_width//2 - text_w//2, y + 18), metric, fill=CORAL, font=font_stat_large)

        # Title
        bbox = draw.textbbox((0, 0), title, font=font_body_bold)
        text_w = bbox[2] - bbox[0]
        draw.text((benefit_x + benefit_width//2 - text_w//2, y + 68), title, fill=TEAL_DARK, font=font_body_bold)

        # Description
        bbox = draw.textbbox((0, 0), desc, font=font_small)
        text_w = bbox[2] - bbox[0]
        draw.text((benefit_x + benefit_width//2 - text_w//2, y + 92), desc, fill=GRAY_TEXT, font=font_small)

    y += benefit_height + 30

    # Footer CTA
    footer_height = 90
    draw.rectangle([0, height - footer_height, width, height], fill=TEAL_DARK)

    text_center(draw, "Transform Your Quote Process Today", font_body_bold, height - footer_height + 25, WHITE, width)
    text_center(draw, "Your brand. Your platform. Powered by AI.", font_subtitle, height - footer_height + 55, TEAL_LIGHT, width)

    # Create output directory if needed
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save
    img.save(output_path, 'PNG', optimize=True)
    print(f"Infographic saved to: {output_path}")

if __name__ == "__main__":
    create_infographic()
