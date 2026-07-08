---
name: Imperial Illuminated Manuscript
colors:
  surface: '#fdf9ef'
  surface-dim: '#dddad0'
  surface-bright: '#fdf9ef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3e9'
  surface-container: '#f1eee4'
  surface-container-high: '#ece8de'
  surface-container-highest: '#e6e2d8'
  on-surface: '#1c1c16'
  on-surface-variant: '#554243'
  inverse-surface: '#31312a'
  inverse-on-surface: '#f4f0e7'
  outline: '#877273'
  outline-variant: '#dac0c1'
  surface-tint: '#9a424c'
  primary: '#4e0616'
  on-primary: '#ffffff'
  primary-container: '#6b1e2a'
  on-primary-container: '#ef858f'
  inverse-primary: '#ffb2b8'
  secondary: '#7e570d'
  on-secondary: '#ffffff'
  secondary-container: '#ffc877'
  on-secondary-container: '#795207'
  tertiary: '#2b240e'
  on-tertiary: '#ffffff'
  tertiary-container: '#423922'
  on-tertiary-container: '#b0a384'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdadb'
  primary-fixed-dim: '#ffb2b8'
  on-primary-fixed: '#40000e'
  on-primary-fixed-variant: '#7c2b36'
  secondary-fixed: '#ffddb0'
  secondary-fixed-dim: '#f3bd6d'
  on-secondary-fixed: '#281800'
  on-secondary-fixed-variant: '#614000'
  tertiary-fixed: '#f0e1c0'
  tertiary-fixed-dim: '#d4c5a5'
  on-tertiary-fixed: '#221b06'
  on-tertiary-fixed-variant: '#4f462d'
  background: '#fdf9ef'
  on-background: '#1c1c16'
  surface-variant: '#e6e2d8'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: 0.01em
  headline-md:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: EB Garamond
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: EB Garamond
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: EB Garamond
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.08em
  label-md:
    fontFamily: EB Garamond
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
spacing:
  margin-page: 4rem
  margin-mobile: 1.5rem
  gutter: 2rem
  section-gap: 6rem
  stack-sm: 0.75rem
  stack-md: 1.5rem
---

## Brand & Style

The design system draws inspiration from the meticulous artistry of 16th-century Mughal manuscripts, translating the grandeur of imperial courts into a digital luxury experience. The brand personality is **Sacred**, **Timeless**, and **Revered**, emphasizing the tactile quality of historical craftsmanship over modern digital convenience.

The style is **Traditional-Tactile**, prioritizing:
- **Ornamental Integrity:** Use of geometric and floral borders (Jali and Islimi patterns) to frame content.
- **Parchment Depth:** Surfaces are never flat; they possess the subtle tooth and grain of aged vellum.
- **Calligraphic Hierarchy:** Type is treated as an art form, with generous leading and centered alignments to mimic a folio's layout.
- **Crafted Delicacy:** Thin, hand-drawn lines replace mechanical dividers, often punctuated by small gold motifs or ghungroo-inspired dots.

## Colors

The palette is rooted in natural pigments and precious materials found in traditional miniatures.

- **Ivory (#FAF6EC):** The base layer, acting as a warm, organic canvas. Avoid pure white entirely.
- **Deep Maroon (#6B1E2A):** The primary brand color, used for high-importance text, titles, and structural strokes. It evokes the richness of madder dye and royal velvet.
- **Antique Gold (#B8893E):** Used sparingly for ornamentation, iconography, and interactive highlights. It represents the illumination (tazhib) of a manuscript.
- **Sandstone Beige (#E8D9B8):** Used for subtle backgrounds, secondary containers, and textures that provide depth without breaking the ivory flow.

## Typography

The design system utilizes a strictly serif environment to maintain an air of historical authority and literary elegance. 

- **Display & Headings:** Use EB Garamond with a focus on its elegant italics and ligatures. For large titles, use "Old Style" figures if available. Titles should feel etched into the page.
- **Body:** Body text prioritizes readability through generous line height and wide margins.
- **Labels:** Small labels use uppercase EB Garamond with increased letter-spacing to create a "captioned artifact" aesthetic.
- **Alignment:** Central alignment is preferred for storytelling sections; left alignment is reserved for functional data.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model inspired by the "Shamsha" (sunburst) and traditional folio layouts.

- **Margins:** Exceptionally wide margins are required to create a sense of exclusivity and "the luxury of space." 
- **The Frame:** Most primary views should be contained within a 1px Antique Gold or Deep Maroon border, leaving a significant Ivory margin between the border and the edge of the screen.
- **Vertical Rhythm:** Spacing is deliberate and slow. Elements are separated by "white space" that is actually a textured Ivory surface.
- **Mobile Adaption:** On mobile, margins reduce to 24px, and the double-line borders may simplify to a single delicate line to preserve screen real estate while maintaining the manuscript feel.

## Elevation & Depth

This design system avoids modern shadows. Depth is achieved through **Tonal Layering** and **Ornamental Framing**:

- **Layering:** Elements sit on the page rather than floating above it. Use Sandstone Beige (#E8D9B8) to create "sunken" or "raised" sections by changing the background tint.
- **Inner Borders:** Depth is suggested via 1px inset borders in Gold, creating a "pressed" look similar to leather-bound book covers.
- **Backdrop:** A very subtle, non-repeating parchment texture (low opacity) is applied to the Ivory base to provide organic micro-depth.

## Shapes

The shape language is **Strictly Geometric and Sharp**. 

- **Rectilinear:** Use 0px corner radii for all primary containers, buttons, and input fields.
- **Ornamental Modification:** While corners are sharp, the "inner" corners of decorative frames may feature 45-degree chamfers or subtle arched "mihrab" peaks to reference Mughal architecture.
- **Dividers:** Horizontal rules are never plain lines. They feature a central "Ghungroo" (small bell/dot) motif or a hand-drawn floral flourish in the center.

## Components

- **Buttons:** Rectangular with a 1px Deep Maroon border. The background is Ivory. On hover, the background shifts to a very light wash of Antique Gold. Text is always uppercase with tracked-out spacing.
- **Cards:** Defined by a double-line border (one thin Gold line, one thicker Maroon line). Backgrounds can be Ivory or Sandstone.
- **Inputs:** Simple underlined fields (bottom border only) in Maroon. The label sits above in a small, italicized serif.
- **Chips:** Small, sharp-edged boxes with a Sandstone background and Maroon text.
- **Iconography:** Icons must look hand-drawn with varying line weights. Use gold for icons. Motifs include lotuses, cypress trees, and geometric latticework.
- **Dividers:** Use a "Manuscript Break"—a horizontal line that fades out at the edges with a central gold diamond or floral motif.