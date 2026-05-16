# DRIVN Buyer Portal

A static GitHub Pages app for Driva Coffee Processing.

## Features
- Buyer-facing lot catalog
- Responsive mobile-first UI inspired by the provided ClickLearn style
- Editable item/lot library in Owner Mode
- PDF spec sheet generation for lots/process details
- WhatsApp lot request button
- Data saved in browser localStorage

## Important limitation
GitHub Pages is static. The Owner Mode PIN only hides editing in the interface and is not real security. For real owner-only editing across devices, use Firebase Auth + Firestore.

## Setup
1. Upload `index.html`, `styles.css`, and `app.js` to your GitHub Pages repository.
2. Edit `app.js`:
   - Change `OWNER_PIN`
   - Change `WHATSAPP_NUMBER`
3. Enable GitHub Pages from repository settings.

