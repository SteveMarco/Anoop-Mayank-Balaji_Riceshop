# Rice Wholesale Management — Functional Brand & Stock Version

This version includes functional brand/product and inventory management.

## Owner can
- Add a new rice brand/product
- Edit brand, rice name, pack size, wholesale price and stock
- Remove a brand/product from the catalog
- Increase stock by one pack
- Decrease stock by one pack
- Set an exact stock quantity
- Configure low-stock threshold
- See total brands, products, total bags and low-stock items
- Customers only see active products
- Export business data backup

## Stock safety
The frontend includes stock fields and helper functions for stock validation/deduction. A production deployment must enforce the same checks server-side to prevent race conditions or overselling.

## Important
This is still a frontend/static package. Real production authentication, inventory transactions, payment processing and customer/order data should be stored and validated by a secure backend/database.
