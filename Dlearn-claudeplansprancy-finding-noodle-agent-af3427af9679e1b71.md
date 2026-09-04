# Implementation Plan: Premium SaaS Landing Page

## 1. Overview
The goal is to build a high-end, minimalist SaaS landing page with a centered composition, huge typography, and a complex "Product Visual" that communicates intelligence and automation without looking like a task board.

## 2. Component Architecture
New components will be located in `components/landing/`.

### New Files
- `components/landing/LandingPage.tsx`: Main orchestrator for the layout.
- `components/landing/Navbar.tsx`: Navigation bar with logo, links, and CTA.
- `components/landing/Hero.tsx`: Hero section containing the badge, heading, subtext, and buttons.
- `components/landing/ProductVisual.tsx`: The complex abstract interface visual.
- `components/landing/FloatingCard.tsx`: Reusable card wrapper for the floating elements.

## 3. Technical Design

### Layout & Background
- **Outer Container**: A large rounded container (`rounded-[3rem]`) with a soft shadow (`shadow-2xl`) and a subtle border.
- **Grid Background**: Implemented via a CSS linear-gradient to create a subtle light-gray grid pattern.
  - Pattern: `40px 40px` size, using `--border` color.
- **Composition**: Everything is centered with generous whitespace (padding `px-8 py-12` to `px-16 py-24`).

### Typography & Colors
- **Colors**:
  - Primary: Black (`text-foreground`).
  - Background: Off-white (`bg-background`).
  - Secondary: Neutral gray (`text-muted-foreground`).
- **Hierarchy**:
  - Heading: `text-5xl` to `text-7xl`, `font-bold`, `tracking-tighter`, `leading-[1.1]`.
  - Body: `text-lg`, `text-muted-foreground`, `max-w-[700px]`.

### Product Visual Implementation
The `ProductVisual` will be a `relative` container.

1. **Central Workspace**:
   - A large, rounded container representing the core product interface.
   - Content: Abstract data streams, a central "AI Core" glowing element, and a few node-like points.
   - Style: `bg-card border shadow-inner`.

2. **Floating Cards** (`FloatingCard.tsx`):
   - Positioned absolutely around the workspace.
   - Style: ` rounded-lg border bg-card shadow-sm p-4`.
   - **Card Types**:
     - **Analytics**: Small SVG growth curve chart.
     - **AI**: Mock prompt input with a "sparkle" icon.
     - **Collaboration**: Overlapping user avatars + "Join" badge.
     - **Automation**: A simple "If X $\to$ Then Y" flow snippet.

3. **Connection Lines**:
   - SVGs with `stroke-dasharray` for a pulsing effect.
   - Lines connect the Central Workspace to the Floating Cards.

### Animations
- **Floating Effect**: A custom CSS animation `@keyframes float` applied to floating cards.
- **Interactions**: 
  - `hover:-translate-y-1 transition-transform duration-300` for cards.
  - Standard Tailwind transitions for buttons.

## 4. Step-by-Step Implementation

### Phase 1: Foundation
1. Create `components/landing/LandingPage.tsx`.
2. Implement the outer container and the grid background.
3. Integrate `components/landing/Navbar.tsx` and `components/landing/Hero.tsx`.

### Phase 2: The Visual Core
1. Create `components/landing/FloatingCard.tsx`.
2. Implement `components/landing/ProductVisual.tsx`.
3. Build the Central Workspace.
4. Add the four specialized floating cards.
5. Draw the SVG connection lines.

### Phase 3: Polishing
1. Add the `float` animation to `globals.css`.
2. Apply animations to `FloatingCard` components.
3. Fine-tune responsiveness (scaling the `ProductVisual` for mobile).
4. Final contrast and spacing audit.

## 5. Verification Checklist
- [ ] **Design**: Does it match the "premium" aesthetic (huge type, minimalist)?
- [ ] **Constraints**: Are `Button`, `Badge`, and `Card` used from `ui/`?
- [ ] **Visual**: Does the `ProductVisual` avoid looking like a Kanban/Task board?
- [ ] **Responsiveness**: Is the layout stable on Mobile, Tablet, and Desktop?
- [ ] **Performance**: Are animations smooth and lightweight?

## 6. Critical Files for Implementation
- `app/globals.css` (for animations and variables)
- `components/landing/LandingPage.tsx`
- `components/landing/ProductVisual.tsx`
- `components/landing/FloatingCard.tsx`
- `components/ui/button.tsx`
