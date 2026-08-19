# Wangchuk Tour - Agent Memory

## Project Context
- **Client**: Wangchuk Tour (Bhutanese tourism company)
- **Project Location**: `D:\VS STUDIO PROJECT\wangchuk-tour`
- **Repository**: https://github.com/famedigital/wangchukstour.git
- **Tech Stack**: Next.js 16.2.9 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, shadcn/ui
- **Deployment**: Vercel (https://wangchukstour.vercel.app)
- **Backend**: Supabase (installed but not configured - using mock data)

## Design System (Premium Red Theme)

### Color Palette
```css
/* Primary Red Colors */
--prayer-red: #DC143C;
--monastery-red: #B91C1C;
--crimson: #DC143C;

/* Accent Colors */
--prayer-blue: #1E3A5F;
--prayer-green: #4A6741;
--prayer-yellow: #D4A017;

/* Gradients */
linear-gradient(135deg, #DC143C 0%, #8B0000 50%, #D4A017 100%)
linear-gradient(135deg, #DC143C 0%, #B91C1C 100%)
```

### Typography
- **Headings**: Custom font-heading (Poppins/Plus Jakarta Sans)
- **Body**: Inter/default sans
- **Animations**: Framer Motion with smooth easing

### Design Principles
- **No borders**: Use shadows instead of borders for modern look
- **Shadows**: `shadow-lg` is standard
- **Centering**: Container max-width 1400px with auto margins
- **Responsive**: Mobile-first approach with proper breakpoints

## Project Status

### Completed (Phase 4: Public Pages) ✅
- [x] Homepage with premium sunset hero section
- [x] Tours listing with filtering system
- [x] Tour detail pages
- [x] About page
- [x] Blog listing & detail pages
- [x] Contact page with form
- [x] Navigation component (transparent on homepage, solid on other pages)
- [x] Footer component
- [x] Premium animations (ScrollReveal, StaggerChildren, MagneticButton)
- [x] Mock data for tours and blogs

### Mock Admin Dashboard ✅
- [x] Admin panel at `/admin/dashboard` for client visualization
- [x] Dashboard with mock statistics
- [x] Bookings management (mock data)
- [x] Tours management (mock data)
- [x] Inquiries management (mock data)
- [x] Blog preview (mock data)
- [x] Settings interface
- **Note**: No backend connection - all data is hardcoded for visualization

### Design Updates Completed ✅
- [x] Red gradient theme applied across all pages
- [x] Removed all black borders (replaced with shadows)
- [x] Fixed container centering (max-width: 1400px, auto margins)
- [x] Redesigned tour cards (more compact, price overlay, icon badges)
- [x] Fixed TypeScript build errors for Vercel deployment
- [x] Updated hero CTA button to white

## Important File Locations

### Pages
```
app/
├── page.tsx                    # Homepage with sunset hero
├── tours/
│   ├── page.tsx               # Tours listing with filters
│   └── [slug]/page.tsx       # Tour detail pages
├── blog/
│   ├── page.tsx               # Blog listing
│   └── [slug]/page.tsx       # Blog detail
├── about/page.tsx             # About page
├── contact/page.tsx          # Contact page
└── admin/
    └── dashboard/page.tsx     # Mock admin dashboard
```

### Components
```
components/
├── public/
│   ├── Navigation.tsx         # Transparent on home, solid elsewhere
│   └── Footer.tsx
├── ui/
│   ├── card.tsx              # Fixed: no borders, uses shadow-lg
│   ├── magnetic-button.tsx   # Fixed TypeScript errors
│   └── scroll-reveal.tsx     # Fixed TypeScript errors
└── animations/
    └── prayer-flags.tsx      # Animated prayer flags
```

### Data
```
lib/mock-data/
├── tours.ts                  # 5 sample tours
└── blogs.ts                  # 4 sample blog posts
```

## Key Implementation Details

### Navigation Component
- **Homepage**: Transparent background with white text
- **Other pages**: Solid background with proper contrast
- **Mobile**: Responsive hamburger menu

### Tour Cards Design
- Compact layout (h-56 instead of h-64)
- Price overlay on image (bottom-right)
- Icon badges with gradient backgrounds
- Inline "View Details" CTA
- No borders, uses shadows

### Container CSS (app/globals.css)
```css
.container {
  width: 100%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 2rem;
  padding-right: 2rem;
}
```

### Card Component Fix
- Removed `ring-1 ring-foreground/10` (was causing borders)
- Replaced with `shadow-lg`
- Removed `border-t` from CardFooter

## Vercel Deployment
- **URL**: https://wangchukstour.vercel.app
- **Status**: Active and building successfully
- **Recent Fixes**:
  - Fixed MagneticButton TypeScript errors
  - Fixed scroll-reveal TypeScript errors
  - Added missing Plus icon import in admin dashboard

## Backend Status
- **Supabase**: Installed but not configured
- **Current State**: Using mock data for all features
- **Admin Panel**: Mock dashboard at `/admin/dashboard` (no authentication)

## GitHub Repository
- **Remote**: https://github.com/famedigital/wangchukstour.git
- **Branch**: master
- **Recent Commits**:
  - Added mock admin dashboard
  - Fixed TypeScript build errors
  - Updated hero CTA button to white

## Development Commands
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Sync to GitHub
git add .
git commit -m "message"
git push
```

## Known Issues / Future Work
- Supabase needs to be configured for real backend
- Authentication system not implemented
- CMS inline editing not implemented
- Real booking system not connected

## Quick Reference for Agents

### When Working on This Project:
1. **Always read AGENT_MEMORY.md first** to understand context
2. **Use premium red gradient theme** for all new features
3. **Never add borders** - use shadows instead
4. **Ensure proper centering** with max-width: 1400px container
5. **Maintain consistent design** across all pages
6. **Test TypeScript build** before pushing (`npm run build`)

### Color Usage Guide
- **Primary CTAs**: `linear-gradient(135deg, #DC143C 0%, #8B0000 100%)`
- **Badges**: `linear-gradient(135deg, #DC143C 0%, #B91C1C 100%)`
- **Accents**: Gold gradients for featured items
- **Backgrounds**: Use muted/50 variants, not black

### Common Patterns
- **Hero sections**: Gradient backgrounds with ScrollReveal animations
- **Cards**: rounded-2xl, shadow-lg, hover effects
- **Buttons**: MagneticButton for premium feel
- **Grid**: Responsive with proper breakpoints
- **Spacing**: Consistent py-16 to py-32 for sections
