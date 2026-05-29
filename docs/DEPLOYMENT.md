# TravelCanvas AI - Deployment Guide

## 🚀 Quick Deploy to Vercel (Recommended)

### Method 1: Vercel Dashboard
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"
6. Done! Your app is live 🎉

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd travelcanvas-ai
vercel

# Follow the prompts
# Your app will be live in seconds!
```

## 📦 Other Deployment Options

### Netlify

1. **Via Dashboard**
   ```bash
   # Build command: npm run build
   # Publish directory: .next
   ```

2. **Via CLI**
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

### AWS Amplify

1. Connect your GitHub repository
2. Build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```

### Railway

1. Connect GitHub repository
2. Railway auto-detects Next.js
3. Deploy automatically

### Render

1. Create new Web Service
2. Connect repository
3. Build command: `npm run build`
4. Start command: `npm start`

## 🔧 Pre-Deployment Checklist

### 1. Environment Variables
```bash
# Create .env.local for production
# Add any API keys if using real AI services
OPENAI_API_KEY=your_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Build Test
```bash
# Test production build locally
npm run build
npm start

# Visit http://localhost:3000
# Test all features
```

### 3. Performance Check
```bash
# Run Lighthouse audit
# Target scores:
# - Performance: 90+
# - Accessibility: 95+
# - Best Practices: 95+
# - SEO: 100
```

### 4. Browser Testing
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers

## 🌐 Custom Domain Setup

### Vercel
1. Go to Project Settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records
5. Wait for SSL certificate

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS
4. Enable HTTPS

## 📊 Post-Deployment

### 1. Analytics Setup (Optional)

#### Google Analytics
```typescript
// app/layout.tsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'GA_MEASUREMENT_ID');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

#### Vercel Analytics
```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Error Monitoring (Optional)

#### Sentry
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 3. Performance Monitoring

#### Vercel Speed Insights
```bash
npm install @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

## 🔒 Security Checklist

- ✅ Environment variables secured
- ✅ API keys not in code
- ✅ HTTPS enabled
- ✅ Security headers configured
- ✅ Dependencies updated
- ✅ No console.logs in production

## 🎯 SEO Optimization

### 1. Meta Tags
Already configured in `app/layout.tsx`:
```typescript
export const metadata = {
  title: "TravelCanvas AI - AI-Powered Travel Planning",
  description: "Generate beautiful travel mood boards...",
}
```

### 2. Sitemap (Optional)
```typescript
// app/sitemap.ts
export default function sitemap() {
  return [
    {
      url: 'https://your-domain.com',
      lastModified: new Date(),
    },
    {
      url: 'https://your-domain.com/dashboard',
      lastModified: new Date(),
    },
  ]
}
```

### 3. Robots.txt (Optional)
```typescript
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://your-domain.com/sitemap.xml',
  }
}
```

## 📱 Progressive Web App (Optional)

### Add PWA Support
```bash
npm install next-pwa
```

```javascript
// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  // your next config
})
```

## 🔄 CI/CD Setup

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm test # if you have tests
```

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working
- Ensure variables start with `NEXT_PUBLIC_` for client-side
- Restart dev server after adding variables
- Check Vercel dashboard for production variables

### Images Not Loading
- Check image URLs are accessible
- Verify Next.js Image optimization settings
- Check network tab for errors

### Slow Performance
- Enable image optimization
- Check bundle size
- Use dynamic imports for large components
- Enable caching headers

## 📈 Monitoring

### Key Metrics to Track
- Page load time
- Time to interactive
- Core Web Vitals
- Error rate
- User engagement
- Conversion rate

### Tools
- Vercel Analytics
- Google Analytics
- Sentry
- LogRocket
- Hotjar

## 🎉 Launch Checklist

- [ ] Code pushed to GitHub
- [ ] Production build tested
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics installed
- [ ] Error monitoring setup
- [ ] Performance optimized
- [ ] SEO configured
- [ ] Social media cards
- [ ] README updated
- [ ] Documentation complete

## 🚀 Go Live!

Once everything is checked:
1. Deploy to production
2. Test all features
3. Share with the world
4. Monitor performance
5. Gather feedback
6. Iterate and improve

---

**Your app is ready for the world! 🌍✨**

Need help? Check the [Next.js deployment docs](https://nextjs.org/docs/deployment)
