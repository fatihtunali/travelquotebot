from reportlab.lib import colors
from reportlab.lib.pagesizes import A3, portrait
from reportlab.lib.units import inch, mm
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
import os

# Register fonts
font_dir = r"C:\Users\fatih\.claude\plugins\marketplaces\anthropic-agent-skills\canvas-design\canvas-fonts"
pdfmetrics.registerFont(TTFont('BricolageGrotesque-Bold', os.path.join(font_dir, 'BricolageGrotesque-Bold.ttf')))
pdfmetrics.registerFont(TTFont('BricolageGrotesque', os.path.join(font_dir, 'BricolageGrotesque-Regular.ttf')))
pdfmetrics.registerFont(TTFont('WorkSans', os.path.join(font_dir, 'WorkSans-Regular.ttf')))
pdfmetrics.registerFont(TTFont('WorkSans-Bold', os.path.join(font_dir, 'WorkSans-Bold.ttf')))
pdfmetrics.registerFont(TTFont('DMMono', os.path.join(font_dir, 'DMMono-Regular.ttf')))

# Colors
TEAL_DARK = HexColor('#277884')
TEAL_LIGHT = HexColor('#5EA8A7')
CORAL = HexColor('#FE4447')
WHITE = HexColor('#FFFFFF')
GRAY_LIGHT = HexColor('#f8f9fa')
GRAY_TEXT = HexColor('#666666')
GRAY_DARK = HexColor('#333333')

# Page setup - A3 Portrait
width, height = portrait(A3)
output_path = r"C:\Users\fatih\Desktop\Travel Quote Bot\workspace\TravelQuoteBot-Infographic.pdf"

def draw_rounded_rect(c, x, y, w, h, radius, fill_color=None, stroke_color=None, stroke_width=1):
    """Draw a rounded rectangle"""
    c.saveState()
    if fill_color:
        c.setFillColor(fill_color)
    if stroke_color:
        c.setStrokeColor(stroke_color)
        c.setLineWidth(stroke_width)

    p = c.beginPath()
    p.moveTo(x + radius, y)
    p.lineTo(x + w - radius, y)
    p.arcTo(x + w - radius, y, x + w, y + radius, 90)
    p.lineTo(x + w, y + h - radius)
    p.arcTo(x + w - radius, y + h - radius, x + w, y + h, 0)
    p.lineTo(x + radius, y + h)
    p.arcTo(x, y + h - radius, x + radius, y + h, -90)
    p.lineTo(x, y + radius)
    p.arcTo(x, y, x + radius, y + radius, 180)
    p.close()

    if fill_color and stroke_color:
        c.drawPath(p, fill=1, stroke=1)
    elif fill_color:
        c.drawPath(p, fill=1, stroke=0)
    else:
        c.drawPath(p, fill=0, stroke=1)
    c.restoreState()

def draw_arrow(c, x1, y1, x2, y2, color=TEAL_LIGHT):
    """Draw an arrow between two points"""
    import math
    c.saveState()
    c.setStrokeColor(color)
    c.setFillColor(color)
    c.setLineWidth(2)
    c.line(x1, y1, x2, y2)

    # Arrowhead using path
    angle = math.atan2(y2 - y1, x2 - x1)
    arrow_size = 8
    p = c.beginPath()
    p.moveTo(x2, y2)
    p.lineTo(x2 - arrow_size * math.cos(angle - 0.5), y2 - arrow_size * math.sin(angle - 0.5))
    p.lineTo(x2 - arrow_size * math.cos(angle + 0.5), y2 - arrow_size * math.sin(angle + 0.5))
    p.close()
    c.drawPath(p, fill=1, stroke=0)
    c.restoreState()

def create_infographic():
    c = canvas.Canvas(output_path, pagesize=portrait(A3))

    margin = 40
    content_width = width - 2 * margin

    # Background
    c.setFillColor(WHITE)
    c.rect(0, 0, width, height, fill=1)

    # Header section with teal background
    header_height = 120
    c.setFillColor(TEAL_DARK)
    c.rect(0, height - header_height, width, header_height, fill=1)

    # Title
    c.setFillColor(WHITE)
    c.setFont('BricolageGrotesque-Bold', 42)
    c.drawString(margin, height - 55, "Travel Quote Bot")

    c.setFont('WorkSans', 16)
    c.setFillColor(TEAL_LIGHT)
    c.drawString(margin, height - 85, "AI-Powered Travel Quotes in Minutes, Not Hours")

    # Current Y position
    y = height - header_height - 40

    # Section 1: The Problem
    c.setFillColor(GRAY_DARK)
    c.setFont('BricolageGrotesque-Bold', 18)
    c.drawString(margin, y, "THE PROBLEM")

    y -= 25

    # Problem box
    box_height = 60
    draw_rounded_rect(c, margin, y - box_height, content_width, box_height, 8, CORAL)

    c.setFillColor(WHITE)
    c.setFont('WorkSans-Bold', 14)
    c.drawString(margin + 20, y - 25, "Tour operators spend 2-4 HOURS creating each quote manually")
    c.setFont('WorkSans', 12)
    c.drawString(margin + 20, y - 45, "Spreadsheets, pricing lookups, error-prone calculations, inconsistent formatting")

    y -= box_height + 30

    # Problem stats
    stats = [
        ("2-4 hrs", "Per quote"),
        ("100+", "Price checks"),
        ("High", "Error risk")
    ]

    stat_width = content_width / 3
    for i, (number, label) in enumerate(stats):
        stat_x = margin + i * stat_width

        # Stat box
        draw_rounded_rect(c, stat_x + 5, y - 50, stat_width - 10, 50, 6, GRAY_LIGHT)

        # Border accent
        c.setStrokeColor(TEAL_DARK)
        c.setLineWidth(3)
        c.line(stat_x + 5, y - 50, stat_x + 5, y)

        c.setFillColor(TEAL_DARK)
        c.setFont('DMMono', 24)
        c.drawCentredString(stat_x + stat_width/2, y - 25, number)

        c.setFillColor(GRAY_TEXT)
        c.setFont('WorkSans', 10)
        c.drawCentredString(stat_x + stat_width/2, y - 42, label)

    y -= 80

    # Section 2: The Solution
    c.setFillColor(GRAY_DARK)
    c.setFont('BricolageGrotesque-Bold', 18)
    c.drawString(margin, y, "THE SOLUTION")

    y -= 25

    # Solution box
    draw_rounded_rect(c, margin, y - 60, content_width, 60, 8, TEAL_LIGHT)

    c.setFillColor(WHITE)
    c.setFont('WorkSans-Bold', 14)
    c.drawString(margin + 20, y - 25, "AI generates complete itineraries with real-time pricing")
    c.setFont('WorkSans', 12)
    c.drawString(margin + 20, y - 45, "Day-by-day plans, hotel selections, tours, transfers, meals - all automatically priced")

    y -= 90

    # Section 3: How It Works - Customer Journey
    c.setFillColor(GRAY_DARK)
    c.setFont('BricolageGrotesque-Bold', 18)
    c.drawString(margin, y, "HOW IT WORKS")

    y -= 30

    # Journey steps
    steps = [
        ("1", "SELECT", "Destinations, dates, preferences"),
        ("2", "GENERATE", "AI creates full itinerary"),
        ("3", "PREVIEW", "Review pricing & details"),
        ("4", "BOOK", "Send to customer")
    ]

    step_width = content_width / 4
    step_height = 70

    for i, (num, title, desc) in enumerate(steps):
        step_x = margin + i * step_width

        # Step box
        draw_rounded_rect(c, step_x + 5, y - step_height, step_width - 10, step_height, 6, WHITE, TEAL_LIGHT, 2)

        # Number circle
        circle_x = step_x + step_width/2
        circle_y = y - 18
        c.setFillColor(CORAL)
        c.circle(circle_x, circle_y, 12, fill=1)

        c.setFillColor(WHITE)
        c.setFont('WorkSans-Bold', 12)
        c.drawCentredString(circle_x, circle_y - 4, num)

        # Title and description
        c.setFillColor(TEAL_DARK)
        c.setFont('WorkSans-Bold', 11)
        c.drawCentredString(step_x + step_width/2, y - 40, title)

        c.setFillColor(GRAY_TEXT)
        c.setFont('WorkSans', 8)
        # Word wrap for description
        words = desc.split()
        if len(words) > 2:
            line1 = ' '.join(words[:2])
            line2 = ' '.join(words[2:])
            c.drawCentredString(step_x + step_width/2, y - 52, line1)
            c.drawCentredString(step_x + step_width/2, y - 62, line2)
        else:
            c.drawCentredString(step_x + step_width/2, y - 55, desc)

        # Arrow between steps
        if i < 3:
            arrow_x = step_x + step_width - 5
            draw_arrow(c, arrow_x, y - step_height/2, arrow_x + 10, y - step_height/2, TEAL_LIGHT)

    y -= step_height + 30

    # Section 4: What AI Creates
    c.setFillColor(GRAY_DARK)
    c.setFont('BricolageGrotesque-Bold', 18)
    c.drawString(margin, y, "WHAT AI CREATES")

    y -= 25

    # AI output items
    ai_outputs = [
        "Day-by-day narrative",
        "Hotel selections",
        "Tours & activities",
        "Transportation",
        "Meal plans",
        "Pricing breakdown"
    ]

    output_width = content_width / 3
    output_height = 35

    for i, item in enumerate(ai_outputs):
        row = i // 3
        col = i % 3
        item_x = margin + col * output_width
        item_y = y - row * (output_height + 8)

        draw_rounded_rect(c, item_x + 3, item_y - output_height, output_width - 6, output_height, 4, GRAY_LIGHT)

        # Check mark
        c.setFillColor(TEAL_LIGHT)
        c.setFont('WorkSans-Bold', 14)
        c.drawString(item_x + 12, item_y - 23, "✓")

        c.setFillColor(GRAY_DARK)
        c.setFont('WorkSans', 10)
        c.drawString(item_x + 30, item_y - 23, item)

    y -= 2 * (output_height + 8) + 25

    # Section 5: Pricing Categories
    c.setFillColor(GRAY_DARK)
    c.setFont('BricolageGrotesque-Bold', 18)
    c.drawString(margin, y, "8 PRICING CATEGORIES")

    y -= 25

    categories = [
        "Hotels", "Tours", "Vehicles", "Transfers",
        "Guides", "Entrance Fees", "Meals", "Extras"
    ]

    cat_width = content_width / 4
    cat_height = 30

    for i, cat in enumerate(categories):
        row = i // 4
        col = i % 4
        cat_x = margin + col * cat_width
        cat_y = y - row * (cat_height + 6)

        draw_rounded_rect(c, cat_x + 3, cat_y - cat_height, cat_width - 6, cat_height, 4, WHITE)

        # Bottom border
        c.setStrokeColor(TEAL_LIGHT)
        c.setLineWidth(3)
        c.line(cat_x + 3, cat_y - cat_height, cat_x + cat_width - 3, cat_y - cat_height)

        c.setFillColor(TEAL_DARK)
        c.setFont('WorkSans', 10)
        c.drawCentredString(cat_x + cat_width/2, cat_y - 20, cat)

    y -= 2 * (cat_height + 6) + 10

    # Note about seasonal pricing
    c.setFillColor(GRAY_TEXT)
    c.setFont('WorkSans', 9)
    c.drawCentredString(width/2, y, "All pricing is seasonal - AI automatically selects correct prices based on travel dates")

    y -= 35

    # Section 6: Benefits
    c.setFillColor(GRAY_DARK)
    c.setFont('BricolageGrotesque-Bold', 18)
    c.drawString(margin, y, "THE BENEFITS")

    y -= 30

    # Benefit boxes
    benefits = [
        ("90%", "Time Saved", "Minutes instead of hours"),
        ("0", "Errors", "Automatic calculations"),
        ("100%", "Professional", "Beautiful proposals")
    ]

    benefit_width = content_width / 3
    benefit_height = 80

    for i, (metric, title, desc) in enumerate(benefits):
        benefit_x = margin + i * benefit_width

        draw_rounded_rect(c, benefit_x + 5, y - benefit_height, benefit_width - 10, benefit_height, 6, WHITE)

        # Top accent
        c.setFillColor(CORAL)
        c.rect(benefit_x + 5, y, benefit_width - 10, 4, fill=1)

        # Metric
        c.setFillColor(CORAL)
        c.setFont('DMMono', 32)
        c.drawCentredString(benefit_x + benefit_width/2, y - 30, metric)

        # Title
        c.setFillColor(TEAL_DARK)
        c.setFont('WorkSans-Bold', 12)
        c.drawCentredString(benefit_x + benefit_width/2, y - 50, title)

        # Description
        c.setFillColor(GRAY_TEXT)
        c.setFont('WorkSans', 9)
        c.drawCentredString(benefit_x + benefit_width/2, y - 65, desc)

    y -= benefit_height + 30

    # Footer CTA
    footer_height = 60
    c.setFillColor(TEAL_DARK)
    c.rect(0, 0, width, footer_height, fill=1)

    c.setFillColor(WHITE)
    c.setFont('BricolageGrotesque-Bold', 16)
    c.drawCentredString(width/2, 35, "Transform Your Quote Process Today")

    c.setFont('WorkSans', 11)
    c.setFillColor(TEAL_LIGHT)
    c.drawCentredString(width/2, 15, "Your brand. Your platform. Powered by AI.")

    # Save
    c.save()
    print(f"Infographic saved to: {output_path}")

if __name__ == "__main__":
    create_infographic()
