# Kiran's Infotech — Client Demonstration Guide

## 1. Demo Environment Overview

When `DEMO_MODE=true`, the platform displays a clear demonstration banner indicating that all inventory, prices, testimonials, and customer records shown are realistic sample data for client evaluation.

### Seeded Dataset Summary
- **8 Product Categories:** Laptops, Desktops & Workstations, Monitors & Displays, SSD & Storage, Memory (RAM), Keyboards & Mice, Printers & Scanners, Computer Accessories.
- **20 New Hardware Products:** Realistic models (Dell Latitude, HP ProBook, Lenovo ThinkPad, ASUS VivoBook, Custom Desktops, Samsung/Crucial NVMe SSDs, Corsair/Kingston RAM, LG/Dell Monitors, Logitech peripherals, HP LaserJet/Epson EcoTank printers) priced in INR (`₹`).
- **8 Refurbished Laptops:** Individual serialized units across lifecycle stages (`PUBLISHED`, `UNDER_INSPECTION`, `REFURBISHMENT`, `QUALITY_CHECK`, `SOLD`) with multi-point `DeviceInspection` reports.
- **10 Hardware Services:** Laptop screen/motherboard repair, SSD upgrade, RAM upgrade, desktop diagnostics, printer repair, thermal servicing, OS/data recovery.
- **10 Demo Customers, 10 Orders, 8 Repair Bookings, 10 Product Enquiries.**

---

## 2. Demo Accounts (Seeded in Non-Production Only)

| Role | Email | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@kiransinfotech.demo` | `Admin@Kiran2026!` | Full access to `/admin` dashboard and operations |
| **Customer 1** | `rahul.sharma@example.demo` | `Customer@2026!` | Has active orders, enquiries, and repair bookings |
| **Customer 2** | `priya.patel@example.demo` | `Customer@2026!` | Secondary account to demonstrate strict data isolation |

---

## 3. Recommended Live Demo Walkthrough

1. **Public Storefront (Guest):**
   - Browse the Homepage, Featured Hardware, Refurbished Laptops section, and Services.
   - Search and filter products in `/products` by category, brand, price, and stock availability.
   - Inspect a refurbished laptop in `/refurbished` to view its verified physical grade, battery health, and inspection checklist.
   - Click a product or service **WhatsApp Enquiry** button to preview the pre-filled contextual WhatsApp message.
2. **Customer Flow (`rahul.sharma@example.demo`):**
   - Log in at `/login` and submit a product enquiry from a product detail page.
   - Book a hardware repair at `/services` and receive a unique reference (`REP-YYYYMMDD-XXXX`).
   - Add an in-stock item to Cart and submit an Order Request.
   - Visit `/account` to track repair status, review/approve repair quotations, and view order history.
3. **Admin Flow (`admin@kiransinfotech.demo`):**
   - Open `/admin` to view live database metrics (products, low-stock alerts, pending orders, enquiries, repairs).
   - View the newly submitted customer enquiry and repair request.
   - Create or publish a product in `/admin/products` and adjust stock in `/admin/inventory` -> verify immediate reflection on `/products`.
   - Update the repair booking status and add both a customer-visible note and a private technician note -> verify the customer sees only the public note in `/account/repairs`.
