# WanderCanvas AI 🌍✨

An AI-powered travel planning platform that generates beautiful travel mood boards, itineraries, packing lists, and destination insights.

![TravelCanvas AI](https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80)

## Features

- 🎨 **AI-Generated Mood Boards** - Pinterest-style visual inspiration
- 🎨 **Color Palette Generator** - Destination-inspired color schemes
- 📍 **Smart Attractions** - Curated places to visit with details
- 🍜 **Local Food Guide** - Authentic dishes and cultural significance
- 🎒 **Smart Packing Assistant** - Dynamic checklist based on your trip
- 📅 **Personalized Itinerary** - Day-by-day travel timeline
- 💡 **Travel Insights** - Local etiquette, safety tips, and phrases
- 💾 **Save & Export** - Store trips and export as PDF
- 🌙 **Dark Mode** - Beautiful dark theme with smooth animations

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Lucide React** - Beautiful icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Avadhut-Pawar31/WanderCanvas
cd travelcanvas-ai
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
travelcanvas-ai/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # UI primitives
│   ├── AnimatedGlobe.tsx
│   ├── Attractions.tsx
│   ├── ColorPalette.tsx
│   ├── DestinationOverview.tsx
│   ├── FloatingCards.tsx
│   ├── FoodRecommendations.tsx
│   ├── Itinerary.tsx
│   ├── LoadingExperience.tsx
│   ├── MoodBoard.tsx
│   ├── PackingList.tsx
│   ├── ThemeToggle.tsx
│   ├── TravelForm.tsx
│   └── TravelInsights.tsx
├── lib/                   # Utilities
│   └── utils.ts
├── services/             # Business logic
│   └── aiService.ts
├── store/                # State management
│   └── useTravelStore.ts
├── types/                # TypeScript types
│   └── index.ts
└── public/               # Static assets
```

## Features in Detail

### Landing Page
- Premium hero section with animated globe
- Floating travel cards with parallax effect
- Gradient mesh background
- Smooth scroll animations

### Travel Form
- Glassmorphism design
- Real-time validation
- 7 travel style options
- Budget and duration inputs

### Dashboard
- Destination hero with key stats
- Masonry mood board layout
- Interactive color palette with copy
- Animated attraction cards
- Food recommendations with cultural notes
- Smart packing checklist with progress
- Visual timeline itinerary
- Travel insights and tips

## Customization

### Adding New Destinations

Edit `services/aiService.ts` and add your destination data:

```typescript
const destinations: Record<string, DestinationData> = {
  'your-city': {
    name: 'Your City',
    description: 'Description...',
    heroImage: 'image-url',
    bestSeason: 'Season',
    weather: 'Weather info',
    dailyBudget: 150,
  },
};
```

### Styling

The app uses Tailwind CSS with a custom design system:
- Colors: Deep Navy, Purple, Indigo, Cyan
- Effects: Glassmorphism, soft shadows, large border radius
- Typography: Inter font family

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Deploy with one click

```bash
npm run build
```

## Performance

- Optimized images with Next.js Image
- Code splitting and lazy loading
- Minimal bundle size
- Fast page transitions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your portfolio or hackathons!

## Acknowledgments

- Images from Unsplash
- Icons from Lucide
- Inspiration from Airbnb, Stripe, and Linear

---

Built with ❤️ for travelers worldwide
