# 🌐 UniversalReview — All-in-One Universal Product Review Platform

An **All-in-One Universal Review Platform** built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**. It combines **Author/Expert In-Depth Laboratory Reviews** with **Community/User-Generated Reviews**, featuring a proprietary **Dynamic Criteria Engine**, side-by-side product comparisons, automated SEO Schema.org generation, and affiliate discovery.

---

## 🚀 Key Features Implemented

### 1. Dynamic Rating Engine (`src/types/index.ts`, `src/components/DynamicScoreRadar.tsx`)
Each category defines its own evaluation metrics rather than forcing a generic rating system:
- **🍔 Food & Beverages:** Taste & Flavor, Nutrition & Health, Value for Money, Packaging Quality.
- **📱 Tech & Gadgets:** Performance, Battery Life, Build Quality, Value for Money.
- **💄 Beauty & Personal Care:** Effectiveness, Skin Friendliness, Scent & Texture, Longevity.
- **🏠 Home & Kitchen:** Durability, Ease of Use, Energy Efficiency, Design & Aesthetics.
- **👕 Fashion & Apparel:** Material & Comfort, Fit & Sizing, Longevity / Build, Style & Design.

Rendered through interactive **Radar/Spider Charts** and animated metric bars.

### 2. The Core Product Review Page (`/product/[slug]`)
- **Hero Section:** High-resolution image carousel with thumbnails, brand, model, release year, price, overall score badge, and "Where to Buy" direct affiliate CTAs (Amazon, Official Store, Best Buy, Daraz).
- **Quick Verdict Card (TL;DR):** Bottom-line summary, The Good (pros with emerald badges), The Bad (cons with rose badges), and audience matching ("Who is this for?" / "Who should skip it?").
- **Dynamic Score Breakdown:** Interactive Recharts radar visualization and score progress meters.
- **Long-Form Editorial Analysis:** Rich structured sections and expandable technical specifications table.
- **Community Reviews & Discussions:** Verified buyer tags, "Was this helpful?" upvoting, and an interactive review submission form with dynamic category sliders.
- **Automated Schema.org JSON-LD:** Injects `Schema.org/Product` and `Schema.org/Review` structured data for Google gold stars and pricing snippets.

### 3. Search, Filter & Discovery Engine (`/`, `/category/[slug]`, `src/components/Navbar.tsx`)
- **Instant Live Search:** Real-time dropdown search as you type, showing product thumbnail, brand, rating, and price.
- **Faceted Category Filtering:** Subcategory pills, price tier filters (Budget, Mid-range, Premium), minimum community rating threshold, Editor's Choice toggle, and custom tags.
- **Multi-criteria Sorting:** Highest editorial score, most popular reviews, price (low/high), and newest releases.

### 4. Side-by-Side Product Comparison Tool (`/compare`)
- Select 2 to 4 products side-by-side.
- Multi-product dynamic score radar overlay.
- Automatic **Winner Badge per Metric** calculation.
- Spec-by-spec parameter comparison matrix.
- Direct affiliate links for compared items.

### 5. Editorial & Admin CMS Dashboard (`/admin`)
- **Product Manager:** View, delete, and manage published reviews.
- **Review & Verdict Builder:** Author full reviews with TL;DR verdict, pros/cons, and live sliders for category dynamic scores.
- **Category Schema Builder:** Define custom rating metrics and new categories dynamically without modifying code.
- **Community Moderation Queue:** Approve or flag user comments and community submissions.

---

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Custom Glassmorphism UI
- **Icons:** Lucide React
- **Data Visualization:** Recharts (Radar charts and score meters)
- **State & Persistence:** React Context + LocalStorage hydration

---

## 🏃 Getting Started

### 1. Install dependencies (already completed):
```bash
npm install
```

### 2. Run local development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Build for Production:
```bash
npm run build
npm start
```

---

## 🗺 Sitemap & Route Structure

- `/` — Homepage (Hero, dynamic criteria teaser, category cards, filtered grid, compare notification)
- `/category/[slug]` — Faceted browse page with subcategories, price tiers, and custom tags
- `/product/[slug]` — In-depth product review page with dynamic radar and community discussions
- `/compare` — Side-by-side product comparison tool with radar overlays and spec matrix
- `/admin` — Editorial CMS, Review Builder, Category Schema Builder, and Moderation Queue
