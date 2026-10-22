# Cái Tiệm Sữa app icon

Current artwork is the blue “Cái Tiệm Sữa” logo supplied by the user. The original artwork is preserved; deployment sizes are resized with Sharp.

- `public/icons/app-icon.png`: 1024 × 1024 master from the square blue-background image.
- `public/icons/icon-192.png` and `icon-512.png`: opaque Android/PWA icons.
- `public/icons/apple-touch-icon.png`: opaque 180 × 180 Apple home-screen icon.
- `public/icons/favicon-32.png`: 32 × 32 favicon from the transparent image.
- `public/icons/icon-maskable-512.png`: 512 × 512 Android maskable icon; the transparent logo is resized to 400 × 400 and centered on an opaque `#0567c9` background to fit inside the launcher safe circle.

The layout and web manifest reference the new PNGs with a `v=milk-logo` version query to refresh cached icons. The previous file-based `app/icon.svg` was removed so Next.js no longer advertises the droplet icon.
