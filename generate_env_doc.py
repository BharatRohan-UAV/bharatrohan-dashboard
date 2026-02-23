"""Generate a one-page PDF documenting the environment variables."""
from fpdf import FPDF
import os

PDF_PATH = os.path.join(os.path.dirname(__file__), "Environment_Variables_Reference.pdf")

pdf = FPDF(orientation="P", unit="mm", format="A4")
pdf.set_auto_page_break(auto=True, margin=10)
pdf.add_page()

def section_header(text):
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_fill_color(27, 67, 50)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 7, "  " + text, new_x="LMARGIN", new_y="NEXT", fill=True)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(2)

def env_var(name, desc):
    pdf.set_font("Courier", "B", 7.5)
    pdf.cell(0, 4, "  " + name, new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 7.5)
    pdf.set_text_color(80, 80, 80)
    pdf.multi_cell(0, 3.5, "    " + desc)
    pdf.set_text_color(0, 0, 0)
    pdf.ln(1)

# Title
pdf.set_font("Helvetica", "B", 16)
pdf.set_fill_color(27, 67, 50)
pdf.set_text_color(255, 255, 255)
pdf.cell(0, 10, "  BharatRohan Fleet Dashboard", new_x="LMARGIN", new_y="NEXT", fill=True)
pdf.set_font("Helvetica", "", 11)
pdf.cell(0, 7, "  Environment Variables Reference - February 2026", new_x="LMARGIN", new_y="NEXT", fill=True)
pdf.set_text_color(0, 0, 0)
pdf.ln(3)

pdf.set_font("Helvetica", "I", 7.5)
pdf.cell(0, 4, "All variables must be set at PROJECT level in Vercel (Project > Settings > Environment Variables), not team level.", new_x="LMARGIN", new_y="NEXT")
pdf.ln(2)

# Supabase vars
section_header("Supabase")

env_var("NEXT_PUBLIC_SUPABASE_URL",
    "Supabase project URL. Where to find: Supabase > Settings > API > URL.")

env_var("NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "Supabase anonymous/public key for client-side queries. Safe to expose in browser. Supabase > Settings > API > anon key.")

env_var("SUPABASE_SERVICE_ROLE_KEY",
    "Supabase service role key with elevated privileges. Used ONLY server-side in /api/alerts/check. NEVER prefix with NEXT_PUBLIC_. Supabase > Settings > API > service_role.")

# Alert vars
section_header("Alert System")

env_var("ALERT_FLIGHT_HOURS_THRESHOLD",
    "Flight hours interval that triggers a maintenance alert. Alerts fire at every multiple (50h, 100h, 150h...). Current value: 50")

env_var("ALERT_WEBHOOK_SECRET",
    "Shared secret between Supabase DB webhook and the /api/alerts/check endpoint. Prevents unauthorized calls. Must match the ?secret= param in the Supabase webhook URL. Current value: br_alert_k9x2mw7pqn4j")

# Zoho vars
section_header("Zoho Cliq Notifications")

env_var("ZOHO_CLIQ_COMPANY_ID",
    "BharatRohan Zoho organization/company ID. Found in the Cliq channel API endpoint URL. Current value: 60026676324")

env_var("ZOHO_CLIQ_CHANNEL",
    "Unique name of the Zoho Cliq channel where maintenance alerts are posted. Current value: fleetmaintenancenotifications")

env_var("ZOHO_CLIQ_API_KEY",
    "Webhook token for posting messages to Zoho Cliq. Generate at: Cliq > Bots & Tools > Webhook Tokens (requires 2FA). Max 5 active tokens.")

pdf.ln(1)

# Pipeline
section_header("How the Alert Pipeline Works")

pdf.set_font("Helvetica", "", 7.5)
steps = [
    "1. QGC uploads flight logs and PATCHes drones.total_flight_hours in Supabase.",
    "2. Supabase DB webhook (table: drones, event: UPDATE) fires an HTTP POST.",
    "3. Webhook calls: https://bharatrohan-dashboard.vercel.app/api/alerts/check?secret=...",
    "4. API route computes hours from flight_logs, checks if a new 50h multiple was crossed.",
    "5. If new threshold crossed: inserts row into drone_alerts + POSTs message to Zoho Cliq channel.",
    "6. Dashboard home page fetches unacknowledged drone_alerts, shows banner + model card badge.",
    "7. Adding a maintenance note on the drone detail page acknowledges the alert and records the service date.",
]
for step in steps:
    pdf.cell(0, 4, "  " + step, new_x="LMARGIN", new_y="NEXT")

pdf.ln(2)

# Webhook config
section_header("Supabase DB Webhook Configuration")

pdf.set_font("Helvetica", "", 7.5)
for line in [
    "Location:   Supabase > Database > Webhooks",
    "Name:       drone-hours-alert",
    "Table:      drones    |    Event: UPDATE    |    Method: POST",
    "URL:        https://bharatrohan-dashboard.vercel.app/api/alerts/check?secret=br_alert_k9x2mw7pqn4j",
]:
    pdf.cell(0, 4, "  " + line, new_x="LMARGIN", new_y="NEXT")

pdf.ln(2)

# Security
section_header("Security Notes")

pdf.set_font("Helvetica", "", 7.5)
for note in [
    "- SUPABASE_SERVICE_ROLE_KEY has full DB access. Never expose client-side.",
    "- ZOHO_CLIQ_API_KEY is rotatable via Zoho Cliq admin panel. Sessions expire after 15 min.",
    "- ALERT_WEBHOOK_SECRET should be changed periodically. Update both Vercel + Supabase webhook URL.",
    "- All sensitive values are hidden in Vercel after saving (edit only, no read back).",
]:
    pdf.cell(0, 4, "  " + note, new_x="LMARGIN", new_y="NEXT")

pdf.output(PDF_PATH)
print(f"PDF saved to: {PDF_PATH}")
