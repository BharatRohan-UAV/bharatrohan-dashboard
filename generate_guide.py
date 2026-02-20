"""
BharatRohan Fleet Dashboard - User Guide Generator
Captures screenshots from the live dashboard and generates a PDF guide.
"""

import os
import time
from playwright.sync_api import sync_playwright
from fpdf import FPDF

BASE_URL = "https://bharatrohan-dashboard.vercel.app"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "guide_screenshots")
PDF_PATH = os.path.join(os.path.dirname(__file__), "Fleet_Dashboard_User_Guide.pdf")

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Pages to capture with descriptions
PAGES = [
    {
        "name": "01_home",
        "url": "/",
        "title": "Fleet Overview (Home Page)",
        "description": (
            "The home page shows all drone models in your fleet. "
            "Each card displays the model name, serial number range, "
            "number of registered drones, total flight hours, and log count. "
            "Click 'View Fleet' on any model card to see individual drones."
        ),
        "wait_for": "h1",
        "viewport": {"width": 1280, "height": 900},
    },
    {
        "name": "02_model_fleet",
        "url": "/models/ALOKA",
        "title": "Model Fleet Page",
        "description": (
            "The model fleet page lists every drone registered under that model. "
            "For each drone you can see the serial number, flight hours, "
            "last known GPS location, number of uploaded logs, and when it was last seen. "
            "Click any serial number to view its detailed log history."
        ),
        "wait_for": "table",
        "viewport": {"width": 1280, "height": 900},
    },
    {
        "name": "03_serial_detail",
        "url": None,  # Will be determined dynamically
        "title": "Drone Detail Page",
        "description": (
            "The drone detail page shows the full profile for a single drone: "
            "serial number, model, total flight hours, total distance flown, "
            "number of logs, and the last seen date. Below the summary card is the "
            "flight logs table showing each uploaded log with its flight time, distance, "
            "firmware version, file size, and date. You can download any log file directly."
        ),
        "wait_for": "table",
        "viewport": {"width": 1280, "height": 1000},
    },
    {
        "name": "04_flight_path_desktop",
        "url": None,  # Same as serial detail, but with a log clicked
        "title": "Flight Path View (Desktop)",
        "description": (
            "Click 'View Path' on any log row to open the flight detail panel on the right side. "
            "The panel shows flight statistics (time, distance, firmware, file size), "
            "the last known GPS position, and a satellite map with the flight path drawn "
            "in golden yellow. Green dot marks the start, red dot marks the end of the flight. "
            "Click the X button or click the row again to close the panel."
        ),
        "wait_for": None,  # Manual click
        "viewport": {"width": 1400, "height": 1000},
    },
    {
        "name": "05_flight_path_mobile",
        "url": None,  # Same page, mobile viewport
        "title": "Flight Path View (Mobile)",
        "description": (
            "On mobile devices (screens narrower than 768px), clicking 'View Path' "
            "replaces the logs table with a full-width detail panel. "
            "Tap the golden 'Back to Logs' button at the top to return to the flight logs table. "
            "All the same flight information and map are available in the mobile view."
        ),
        "wait_for": None,
        "viewport": {"width": 390, "height": 844},  # iPhone 14 size
    },
    {
        "name": "06_maintenance_notes",
        "url": None,
        "title": "Maintenance Notes",
        "description": (
            "Below the flight logs table is the Maintenance Notes section. "
            "You can add notes about repairs, inspections, part replacements, or any "
            "observations about the drone. Notes are timestamped and stored per drone. "
            "This helps maintain a service history for each aircraft in your fleet."
        ),
        "wait_for": None,
        "viewport": {"width": 1280, "height": 900},
    },
]


def capture_screenshots():
    """Capture all screenshots using Playwright."""
    screenshots = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # --- Page 1: Home ---
        page = browser.new_page(viewport=PAGES[0]["viewport"])
        page.goto(f"{BASE_URL}/", wait_until="networkidle")
        page.wait_for_selector("h1", timeout=10000)
        time.sleep(1)
        path = os.path.join(OUTPUT_DIR, "01_home.png")
        page.screenshot(path=path, full_page=True)
        screenshots["01_home"] = path
        print(f"Captured: {path}")
        page.close()

        # --- Page 2: Model Fleet ---
        page = browser.new_page(viewport=PAGES[1]["viewport"])
        page.goto(f"{BASE_URL}/models/ALOKA", wait_until="networkidle")
        time.sleep(2)
        path = os.path.join(OUTPUT_DIR, "02_model_fleet.png")
        page.screenshot(path=path, full_page=True)
        screenshots["02_model_fleet"] = path
        print(f"Captured: {path}")

        # Find a serial number link to navigate to
        serial_links = page.query_selector_all("table a")
        serial_href = None
        if serial_links:
            serial_href = serial_links[0].get_attribute("href")
            print(f"Found drone link: {serial_href}")
        page.close()

        # If no ALOKA drones, try PRAVIR-X4
        if not serial_href:
            page = browser.new_page(viewport=PAGES[1]["viewport"])
            page.goto(f"{BASE_URL}/models/PRAVIR-X4", wait_until="networkidle")
            time.sleep(2)
            path = os.path.join(OUTPUT_DIR, "02_model_fleet.png")
            page.screenshot(path=path, full_page=True)
            screenshots["02_model_fleet"] = path
            serial_links = page.query_selector_all("table a")
            if serial_links:
                serial_href = serial_links[0].get_attribute("href")
                print(f"Found drone link: {serial_href}")
            page.close()

        if not serial_href:
            print("WARNING: No drones found — using home page for remaining screenshots")
            serial_href = "/"

        # --- Page 3: Serial Detail ---
        page = browser.new_page(viewport=PAGES[2]["viewport"])
        page.goto(f"{BASE_URL}{serial_href}", wait_until="networkidle")
        time.sleep(2)
        path = os.path.join(OUTPUT_DIR, "03_serial_detail.png")
        page.screenshot(path=path, full_page=True)
        screenshots["03_serial_detail"] = path
        print(f"Captured: {path}")

        # --- Page 4: Flight Path Desktop (click View Path button) ---
        page.set_viewport_size(PAGES[3]["viewport"])
        view_path_buttons = page.query_selector_all("button")
        clicked = False
        for btn in view_path_buttons:
            text = btn.inner_text()
            if "View Path" in text:
                btn.click()
                time.sleep(2)
                clicked = True
                break

        if not clicked:
            # Try clicking a table row directly
            rows = page.query_selector_all("tbody tr")
            if rows:
                rows[0].click()
                time.sleep(2)
                clicked = True

        path = os.path.join(OUTPUT_DIR, "04_flight_path_desktop.png")
        page.screenshot(path=path, full_page=True)
        screenshots["04_flight_path_desktop"] = path
        print(f"Captured: {path}")
        page.close()

        # --- Page 5: Flight Path Mobile ---
        page = browser.new_page(viewport=PAGES[4]["viewport"])
        page.goto(f"{BASE_URL}{serial_href}", wait_until="networkidle")
        time.sleep(2)

        view_path_buttons = page.query_selector_all("button")
        for btn in view_path_buttons:
            text = btn.inner_text()
            if "View Path" in text:
                btn.click()
                time.sleep(2)
                break

        path = os.path.join(OUTPUT_DIR, "05_flight_path_mobile.png")
        page.screenshot(path=path, full_page=True)
        screenshots["05_flight_path_mobile"] = path
        print(f"Captured: {path}")
        page.close()

        # --- Page 6: Maintenance Notes (scroll to bottom) ---
        page = browser.new_page(viewport=PAGES[5]["viewport"])
        page.goto(f"{BASE_URL}{serial_href}", wait_until="networkidle")
        time.sleep(2)
        # Scroll to maintenance notes section at the bottom
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(1)
        path = os.path.join(OUTPUT_DIR, "06_maintenance_notes.png")
        page.screenshot(path=path, full_page=False)  # Viewport only (bottom area)
        screenshots["06_maintenance_notes"] = path
        print(f"Captured: {path}")
        page.close()

        browser.close()

    return screenshots


def generate_pdf(screenshots):
    """Generate a PDF user guide from the screenshots."""
    pdf = FPDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)

    # --- Cover Page ---
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 28)
    pdf.ln(60)
    pdf.cell(0, 15, "BharatRohan", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "B", 22)
    pdf.cell(0, 12, "Fleet Dashboard", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "", 16)
    pdf.cell(0, 12, "User Guide", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(20)
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 8, "https://bharatrohan-dashboard.vercel.app", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(30)
    pdf.set_font("Helvetica", "I", 10)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 8, "Generated: February 2026", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_text_color(0, 0, 0)

    # --- Table of Contents ---
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "Table of Contents", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(8)
    pdf.set_font("Helvetica", "", 12)
    for i, pg in enumerate(PAGES):
        pdf.cell(0, 10, f"{i + 1}.  {pg['title']}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(10)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 10, "7.  Uploading Logs from QGroundControl", new_x="LMARGIN", new_y="NEXT")

    # --- Content Pages ---
    page_width = 190  # mm (A4 width minus margins)

    for i, pg in enumerate(PAGES):
        pdf.add_page()

        # Section title
        pdf.set_font("Helvetica", "B", 16)
        pdf.set_fill_color(27, 67, 50)  # #1B4332
        pdf.set_text_color(255, 255, 255)
        pdf.cell(0, 12, f"  {i + 1}. {pg['title']}", new_x="LMARGIN", new_y="NEXT", fill=True)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(6)

        # Description
        pdf.set_font("Helvetica", "", 11)
        pdf.multi_cell(0, 6, pg["description"])
        pdf.ln(6)

        # Screenshot
        screenshot_key = pg["name"]
        if screenshot_key in screenshots and os.path.exists(screenshots[screenshot_key]):
            img_path = screenshots[screenshot_key]
            try:
                from PIL import Image
                with Image.open(img_path) as img:
                    img_w, img_h = img.size

                # Scale to fit page width (190mm)
                display_w = page_width
                display_h = (img_h / img_w) * display_w

                # If image is too tall for remaining page, limit height
                max_h = 160
                if display_h > max_h:
                    display_h = max_h
                    display_w = (img_w / img_h) * display_h

                # Add border around the screenshot
                pdf.set_draw_color(200, 200, 200)
                x_pos = (210 - display_w) / 2  # Center on A4
                pdf.image(img_path, x=x_pos, w=display_w, h=display_h)
            except Exception as e:
                pdf.set_font("Helvetica", "I", 10)
                pdf.cell(0, 8, f"[Screenshot could not be loaded: {e}]", new_x="LMARGIN", new_y="NEXT")
        else:
            pdf.set_font("Helvetica", "I", 10)
            pdf.cell(0, 8, "[Screenshot not available]", new_x="LMARGIN", new_y="NEXT")

    # --- QGC Upload Instructions Page ---
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_fill_color(27, 67, 50)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 12, "  7. Uploading Logs from QGroundControl", new_x="LMARGIN", new_y="NEXT", fill=True)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(6)

    pdf.set_font("Helvetica", "", 11)
    pdf.multi_cell(0, 6, (
        "Logs are uploaded to the fleet dashboard directly from the BharatRohan "
        "QGroundControl (QGC) app on the SIYI MK15 ground station."
    ))
    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Steps to upload flight logs:", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    pdf.set_font("Helvetica", "", 11)

    steps = [
        "1. Connect the MK15 to the internet (Wi-Fi or mobile hotspot).",
        "2. Open QGC and go to the Analyze View (gear icon > Log Download).",
        "3. Scroll down to the Cloud Upload section.",
        ("4. Select the drone folder you want to upload from the dropdown. "
         "The dropdown lists all MODEL/SERIAL subfolders containing .BIN log files."),
        ("5. Click Upload Logs to Cloud. The upload will skip duplicates, "
         "parse each log for flight time, distance, firmware version, and GPS path, "
         "upload the .BIN file to cloud storage, and update flight hours automatically."),
        ("6. Monitor the progress bar and status messages. Once complete, logs appear "
         "on the fleet dashboard within 60 seconds."),
    ]
    for step in steps:
        pdf.multi_cell(0, 6, step)
        pdf.ln(2)

    pdf.ln(4)
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Troubleshooting:", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    pdf.set_font("Helvetica", "", 11)

    troubleshooting = [
        ("If no folders appear in the dropdown, ensure logs have been downloaded "
         "from the drone to the MK15 local storage first."),
        "If upload fails, check internet connectivity and retry.",
        "Duplicate logs are detected by file name and will not be re-uploaded.",
    ]
    for item in troubleshooting:
        pdf.multi_cell(0, 6, "- " + item)
        pdf.ln(2)

    # Save PDF
    pdf.output(PDF_PATH)
    print(f"\nPDF saved to: {PDF_PATH}")


if __name__ == "__main__":
    print("Capturing screenshots from fleet dashboard...")
    print(f"Dashboard URL: {BASE_URL}\n")

    screenshots = capture_screenshots()
    print(f"\nCaptured {len(screenshots)} screenshots")

    print("\nGenerating PDF guide...")
    generate_pdf(screenshots)
    print("Done!")
