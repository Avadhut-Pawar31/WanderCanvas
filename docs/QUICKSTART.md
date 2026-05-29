# TravelCanvas AI - Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies
```bash
cd travelcanvas-ai
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 What You'll See

### Landing Page
- Beautiful hero section with animated globe
- Floating travel cards with parallax effects
- "Create My Travel Board" button to start

### Travel Form
- Enter your destination (e.g., Paris, Tokyo, Bali)
- Set your budget and trip duration
- Choose your travel style (Luxury, Adventure, etc.)
- Click "Generate My Travel Board"

### Dashboard (Results)
After generation, you'll see:
1. **Destination Overview** - Hero image with key stats
2. **Mood Board** - 8 beautiful images in masonry layout
3. **Color Palette** - 5 destination-inspired colors (click to copy)
4. **Places to Visit** - 6 curated attractions
5. **Local Food Guide** - 5 must-try dishes
6. **Smart Packing List** - Dynamic checklist with progress
7. **Itinerary** - Day-by-day timeline
8. **Travel Insights** - Tips, etiquette, and phrases

## 🎨 Features to Try

### Interactive Elements
- ✅ Check off packing list items
- 💗 Favorite destinations
- 📋 Copy color hex codes
- 🌙 Toggle dark mode (top right)
- 📥 Export to PDF (coming soon)
- 🔗 Share trip (coming soon)

### Pre-configured Destinations
The app has rich data for:
- **Paris** - City of Light
- **Tokyo** - Modern meets traditional
- **Bali** - Tropical paradise

Try these first for the best experience!

## 🛠️ Build for Production

```bash
npm run build
npm start
```

## 📦 Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Deploy with one click

Or use Vercel CLI:
```bash
npm i -g vercel
vercel
```

## 🎭 Customization

### Add New Destinations
Edit `services/aiService.ts` → `generateDestination()` method

### Change Colors
Edit `app/globals.css` and component files

### Modify Animations
Edit Framer Motion props in component files

## 📱 Responsive Design
- Mobile: Optimized for phones
- Tablet: Adaptive layouts
- Desktop: Full experience

## 🐛 Troubleshooting

### Port Already in Use
```bash
npm run dev -- -p 3001
```

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript Errors
```bash
npm run lint
```

## 🎉 You're Ready!

Start creating beautiful travel boards and customize the app to make it your own!

---

**Need Help?** Check the main README.md for detailed documentation.
