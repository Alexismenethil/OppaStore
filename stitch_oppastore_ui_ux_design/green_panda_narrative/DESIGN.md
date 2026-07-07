---
name: Green Panda Narrative
colors:
  surface: '#f4fafd'
  surface-dim: '#d4dbdd'
  surface-bright: '#f4fafd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5f7'
  surface-container: '#e8eff1'
  surface-container-high: '#e2e9ec'
  surface-container-highest: '#dde4e6'
  on-surface: '#161d1f'
  on-surface-variant: '#414940'
  inverse-surface: '#2b3234'
  inverse-on-surface: '#ebf2f4'
  outline: '#717970'
  outline-variant: '#c0c9be'
  surface-tint: '#2f6a3f'
  primary: '#2f6a3f'
  on-primary: '#ffffff'
  primary-container: '#b2f2bb'
  on-primary-container: '#367044'
  inverse-primary: '#96d5a0'
  secondary: '#56624b'
  on-secondary: '#ffffff'
  secondary-container: '#d7e4c7'
  on-secondary-container: '#5a664f'
  tertiary: '#6a5969'
  on-tertiary: '#ffffff'
  tertiary-container: '#f3dcef'
  on-tertiary-container: '#705f6f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b2f2bb'
  primary-fixed-dim: '#96d5a0'
  on-primary-fixed: '#00210b'
  on-primary-fixed-variant: '#145129'
  secondary-fixed: '#dae7ca'
  secondary-fixed-dim: '#becbaf'
  on-secondary-fixed: '#141e0d'
  on-secondary-fixed-variant: '#3f4a35'
  tertiary-fixed: '#f3dcef'
  tertiary-fixed-dim: '#d6c0d2'
  on-tertiary-fixed: '#241724'
  on-tertiary-fixed-variant: '#514251'
  background: '#f4fafd'
  on-background: '#161d1f'
  surface-variant: '#dde4e6'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: DM Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-lg:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-md:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
---

## Brand & Style

The design system is built on the "Green Panda" philosophy: a fusion of fresh Korean aesthetics and the serene atmosphere of Ayacucho. The brand personality is **Kawaii-Modern**—it balances the playful, youthful energy of K-Pop culture with the sophisticated, premium minimalism of high-end skincare boutiques.

The visual style is **Tactile Minimalism**. It utilizes heavy whitespace to create an "airy" breathing room, paired with organic, oversized rounded shapes that feel soft and inviting. The emotional response is one of calm reliability and "fresh-start" energy. Key elements include large floating cards, soft-focus imagery, and subtle, playful interactions that maintain a professional retail standard.

## Colors

The palette is rooted in botanical freshness and soft ceramics.
- **Primary (Pastel Mint):** Used for primary actions, success states, and key highlights. It represents growth and freshness.
- **Secondary (Sage Green):** Used for structural elements, secondary buttons, and text that requires a grounded, organic feel.
- **Background (Warm Off-White):** A soft, non-clinical white that provides a premium, paper-like texture to the interface.
- **Accents (Lilac & Cream):** Used sparingly for promotional badges, category backgrounds (like the circular icons in the reference), and hover states to inject "kawaii" personality without overwhelming the minimalist core.
- **Typography (Soft Black):** A high-contrast but "warm" black to ensure readability while maintaining the soft aesthetic.

## Typography

This design system uses a dual-sans-serif approach to maximize friendliness and modernism.
- **Plus Jakarta Sans** is the headline face. Its soft curves and geometric structure embody the "premium yet approachable" brand promise. Use it for all major headings and product titles.
- **DM Sans** is the workhorse for body copy and UI labels. It offers exceptional legibility at small sizes while maintaining a low-contrast, understated profile that doesn't compete with the headlines.

**Formatting Rules:**
- Keep line lengths for body text between 45-75 characters for optimal readability.
- Use the `label-lg` style for category headers and small meta-information to create a rhythmic hierarchy.

## Layout & Spacing

The layout follows a **Fluid-Fixed Hybrid Grid**. 
- **Desktop:** A 12-column grid with a maximum container width of 1280px. Gutters are kept at a generous 24px to maintain an "airy" feel.
- **Mobile:** A 4-column grid with 16px side margins. 

The spacing rhythm is intentionally loose. Sections should be separated by `xl` (80px) spacing to emphasize the minimalist, premium nature of the shop. Elements within cards use `md` (24px) padding to ensure the "Large Rounded Corners" have enough internal clearance.

## Elevation & Depth

Hierarchy is established through **Ambient Shadows and Tonal Layering** rather than harsh borders.
- **Surface Level 0 (Background):** Off-White (#FCFAF7).
- **Surface Level 1 (Cards):** Pure White (#FFFFFF) with a very soft, diffused shadow (Blur: 30px, Y: 10px, Opacity: 4% Black).
- **Floating Level 2 (Modals/Popovers):** Pure White (#FFFFFF) with a layered shadow (Blur: 50px, Y: 20px, Opacity: 8% Sage Green tint).

Avoid using inner shadows or heavy bevels. The "tactile" feel comes from the generous padding and the extreme corner radii, which make elements feel like physical, smoothed-out ceramic pieces.

## Shapes

The design system uses a **Pill-shaped / Organic** geometry. 
- Standard UI components (Buttons, Inputs) use a minimum of `1rem` (16px) radius.
- Featured Product Cards and Hero Sections utilize an aggressive `1.5rem` to `2.5rem` (24px-40px) radius to create a "squishy" and friendly silhouette.
- Circular shapes are reserved for category navigation and profile avatars, mimicking the look of traditional Korean ceramic plates.

## Components

### Buttons
- **Primary:** Background in Pastel Mint, Text in Soft Black. Pill-shaped. No border.
- **Secondary:** Background in Sage Green, Text in White. Pill-shaped.
- **Ghost:** No background, 1.5px border in Sage Green. 

### Input Fields
- Background is Off-White or very light Gray (#F1F3F5). 
- Borders are only visible on focus, using a 2px Mint Green stroke.
- Placeholder text in a muted Sage Green.

### Cards
- Always white background. 
- Minimum padding of 24px. 
- Image containers within cards should also have large rounded corners (16px+) to match the outer container.

### Chips & Badges
- Used for "New", "Sale", or "Organic" tags. 
- Use the Lilac or Cream accent backgrounds with dark Sage Green text for a playful "kawaii" contrast.

### Lists & Navigation
- Menu items should have generous vertical padding. 
- Active states are indicated by a small Mint Green dot below the text rather than an underline, keeping the look clean and modern.