# J&A Construction: Design Spec (captured from live site, Oct 21 2026)

Current build: WordPress + Elementor 4.x + Elementor Pro, Hello Elementor theme, hosted by Names and Numbers.

## Colors
- Olive (header, footer, buttons bg, "Why work with" panel): rgb(104,110,0) = #686E00
- Green (H2/H4 headings): rgb(0,110,61) = #006E3D
- Body text: rgb(51,51,51) = #333333
- White: #FFFFFF (nav text, h1 on hero, panel text)
- Brown (image captions in the services carousel, "Contact us" button on home): approx #6B3F10, verify against live
- Footer link color computed as rgb(204,51,102) (#CC3366), likely a theme default; footer links look white on olive in the screenshot, so check
- Hero overlay: linear-gradient(202deg, rgba(0,0,0,0.57) 24%, rgba(255,255,255,0) 66%)

## Fonts
- Headings and nav and body: Roboto (nav 16px/400, white)
- Display serif headings (H4/H5, section titles like "LET OUR TEAM IMPROVE YOUR HOME", "WHAT OUR CLIENTS SAY"): Lustria, 700
- Logo is an image (logo.png): small elk photo mark + "J & A Construction" in serif italic caps style + "General Contractor"

## Type scale (desktop, 2560px wide capture)
- H1 (hero): Roboto 71px / 800 / line 78px, white, right aligned
- H2: Roboto 32px / 800 / line 48px, green #006E3D, left
- H4 section title: Lustria 44px / 700 / line 66px, green, centered
- H5: Lustria 36px / 700, white, centered (testimonial heading on dark bg)
- Body: Roboto 16px / 24px, #333
- Button: Roboto 18px / 500, white on olive, radius 4px, padding 15px 30px

## Layout (home page, top to bottom, y offsets at 2560px)
1. Header, y0, h147, olive. Logo left, nav centered (Home, Siding, Addition & Remodel, Gallery, Service Areas with dropdown, Contact), phone icon + (435) 592-0680 right. Active nav item has a light olive outline box. Sticky on scroll (compact ~69px at 1456 wide).
2. Hero, y147, h750. Full width house photo, dark gradient from top right, H1 "Home Improvement Contractors" right aligned with italic serif subline "Cedar City & Southern Utah". Bottom edge is a saw tooth (circular saw blade) divider image, SAW1.png, in white.
3. Intro, y897, h625. Two columns inside ~800px content: left small photo (home under construction, ladder and framing), right H2 + 4 paragraphs.
4. "Why work with", y1522, h512. Split 50/50: left full bleed photo (tool belt on ladder, background image installation.webp), right olive panel with H "Why work with J & A Construction?" (white serif) and three rows, each with a white line icon (hand and house, crossed pencil and ruler, hard hat worker) + uppercase bold white label + small white text. Credentials as bullet list.
5. "LET OUR TEAM IMPROVE YOUR HOME", y2034. Centered Lustria title + centered paragraph.
6. Services carousel, y2230, h563. 3 visible slides, arrows both sides, 6 dots. Each slide: 3:2 photo, uppercase brown Roboto bold caption. Slides: Siding Installation, Remodels, Additions, Gutters Installation, Roofing Installation, General Contracting. Images link to /siding/ or /addition-remodel/. Below: "Contact us for an Estimate on your next home or business improvement project." then olive/brown CONTACT US button.
7. Association logos strip, y2793, h178, white: Southern Utah Home Builders Association, Iron County Home Builders Association, Sunroc.
8. Testimonials, y2971, h462: circular saw icon image above, H5 "WHAT OUR CLIENTS SAY" on dark bg (confirm bg image), two quotes with name in caps and descriptor.
9. Footer, y3433, h299, olive: logo, social icons (Facebook, Yelp, Google), CONTACT INFO column (phone, address, email, hours), "Serving Southern Utah" town list.
10. Copyright bar, y3732, h44, olive.

## Inner pages
Shared structure: header, hero banner with H1 + italic subline "In Cedar City & Southern Utah" and "RESIDENTIAL & COMMERCIAL SERVICE" tag on Siding and Addition pages, alternating image and text blocks, CONTACT US button, footer.
Gallery: 4 featured images, then grouped albums (Exterior Upgrade, Master Bathroom, Guest Shower, Master Bedroom, Guest Bedroom Closets), then about 90 more photos in a grid with lightbox. Closes with short paragraph and CONTACT US.
Contact: intro paragraph, form (Name, Phone, Email, Message, Send), business card block, Google embed map, serving line.

## Not captured, verify before build
- Exact brown value, exact hover states, mobile breakpoints, carousel autoplay timing, testimonial section background, form handling and spam protection, animations (e-animation-grow on images).
- A pixel check against the live site once the rebuild exists.
