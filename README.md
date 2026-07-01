# Abdul Rafeh Portfolio v4

Fresh GitHub Pages-ready portfolio website.

## Files

```txt
index.html
css/styles.css
js/app.js
assets/images/
assets/videos/
```

## What changed

- Added dark / light theme switcher.
- Replaced the laggy DOM dot grid with a smooth canvas hero grid inspired by your JP reference.
- Added stronger line-by-line text animations.
- Added staggered reveal animations across sections.
- Rebuilt the contact section so it is cleaner and responsive.
- Kept projects expandable on the same page.
- Kept placeholders for both still renders and videos.

## Image paths to replace

Upload your images with these names:

```txt
assets/images/luxury-villa-01.jpg
assets/images/luxury-villa-02.jpg
assets/images/lakeside-residence-01.jpg
assets/images/lakeside-residence-02.jpg
assets/images/interior-collection-01.jpg
assets/images/interior-collection-02.jpg
assets/images/cinematic-film-01.jpg
assets/images/cinematic-film-02.jpg
assets/images/japanese-street-01.jpg
assets/images/japanese-street-02.jpg
assets/images/product-visualization-01.jpg
assets/images/product-visualization-02.jpg
assets/images/about-portrait.jpg
```

## Video paths to replace

Upload your videos with these names:

```txt
assets/videos/luxury-villa.mp4
assets/videos/lakeside-residence.mp4
assets/videos/interior-collection.mp4
assets/videos/cinematic-film.mp4
assets/videos/japanese-street.mp4
assets/videos/product-visualization.mp4
```

## Best video export settings

Use MP4, H.264, 1080p max, 10–20 seconds, muted loop style, under 25MB if possible.

## GitHub upload

Unzip this folder, then upload the contents to your GitHub Pages repo. Do not upload the ZIP itself.

## v4 update

- Removed the previous DOM-based grid that made the site lag.
- Added the 9x9 canvas dot grid with gravity/pull movement and falling wave motion.
- The grid follows your dark/light color theme.
- It pauses when the hero is not visible to keep the rest of the site smooth.
- Everything else was kept the same.


Update v6:
- Restored the working 9x9 canvas grid behavior from the reference-style code.
- Made each dot radius smaller.
- Made the grid more subtle in the hero area.
- Kept the rest of the website unchanged.


Update v7:
- Replaced the hero grid with the exact simple canvas dot-grid style provided by the user.
- The grid runs only inside the hero canvas.
- Dots are tiny and subtle.
- No GSAP, no DOM dot spam, no continuous physics loop.


Update v8:
- Dark mode now uses pure black (#000000) as the base site background.
- Hero grid fades out softly at the edges.
- Cursor is now a delayed filled circle.
- Cursor uses mix-blend-mode difference so it flips black/white depending on what it is over.
- Project/work hover cursor becomes a larger circle with a slanted arrow.
- Everything else from v7 was kept unchanged.


Update v9:
- Removed the floating boxed section-panel/card shell from the main sections.
- Sections now flow seamlessly on the page with pure background and large spacing.
- Kept the existing Home / Work / About / Contact structure.
- Kept the Work/project layout and same-page expand behavior unchanged.
- Kept the v8 hero grid, cursor, contact, and theme toggle.
- Text/line reveal animations are now triggered by scroll observation on each animated element.
- Motion timing is slower and more cinematic.


Update v10:
- Mobile-only refinements.
- Desktop layout was left unchanged.
- Shorter mobile hero.
- Mobile dot grid remains active.
- Mobile Work rows are cleaner.
- Project media stacks vertically on phones.
- Cursor remains disabled on touch/mobile.
- Mobile menu is now full-screen and clearer.
- Contact cards are easier to tap.
- Mobile text animations are slightly faster.


Update v11:
- Fixed mobile horizontal scrolling caused by the Work heading.
- Fixed mobile overlap between Location card and Scroll to Explore.
- Added mobile overflow containment.
- Kept desktop view unchanged from v9.


Update v12:
- Added `editor.html`, a visual Canva-style admin/editor page.
- Added `js/site-config.js`, the editable source of truth for site content, design, colors, typography, spacing, animation speed, services, contact info, and projects.
- Added `js/editor.js` and `css/editor.css`.
- The live site now reads from `js/site-config.js`.
- The editor can save local previews using browser storage.
- For permanent GitHub changes, download the generated `site-config.js` from the editor and replace `js/site-config.js` in your repo.
- Media upload inputs in the editor set/preview paths, but GitHub Pages cannot upload files automatically. Upload image/video files manually into `assets/images` or `assets/videos`.


# v13 Editor Instructions

## What changed in v13

This version adds:

- A global caption toggle inside `editor.html`
- Captions hidden by default
- Undo and Redo buttons inside the editor
- No layout/content changes to the main site besides the caption setting

---

## How to edit the website

Open this file in your browser:

```txt
editor.html
```

Use the editor to change:

- website text
- project names
- project order
- project descriptions
- image paths
- video paths
- colors
- font sizes
- letter spacing
- line spacing
- section spacing
- animation speed
- project layout
- captions on/off

---

## How to hide image/video captions

Go to:

```txt
editor.html → Design → Layout → Image/video captions
```

Choose:

```txt
Hide captions
```

Then click:

```txt
Save preview
```

To make it permanent on GitHub, follow the export steps below.

---

## Undo / Redo

Inside `editor.html`, use:

```txt
Undo
Redo
```

This works while you are editing in the current editor session.

Important:

```txt
Undo/Redo does not replace Git history.
```

It is just for quick changes while using the editor.

---

# Very important: how to make sure changes DO NOT disappear on GitHub

GitHub Pages is static hosting.

That means the browser cannot secretly save edits back into your GitHub files by itself.

So the permanent save process is:

## Step 1 — edit in editor.html

Open:

```txt
editor.html
```

Make your changes.

Click:

```txt
Save preview
```

This saves the preview in your current browser only.

## Step 2 — download the permanent config file

In the editor, click:

```txt
Download config
```

This downloads:

```txt
site-config.js
```

## Step 3 — replace the config file on GitHub

In your GitHub repo, go to:

```txt
js/site-config.js
```

Replace that file with the new downloaded:

```txt
site-config.js
```

Commit the change.

Now the website keeps your text, projects, colors, layout, captions, and design changes on every device.

---

# How images and videos work

The editor can set image/video paths, but GitHub Pages cannot upload media files from the editor automatically.

So you must upload the actual files manually.

## Images go here

```txt
assets/images/
```

Example:

```txt
assets/images/luxury-villa-01.jpg
```

## Videos go here

```txt
assets/videos/
```

Example:

```txt
assets/videos/luxury-villa.mp4
```

## Correct workflow for images/videos

1. In `editor.html`, set the path, for example:

```txt
assets/images/my-render.jpg
```

2. Upload the real image file to GitHub inside:

```txt
assets/images/
```

3. Make sure the filename matches exactly:

```txt
my-render.jpg
```

4. Commit the upload.

If the path and filename do not match exactly, the image/video will not show.

---

# Best image/video settings

Use these for smooth loading:

## Images

```txt
.jpg or .webp
1920px wide max
compressed
```

## Videos

```txt
.mp4
H.264
1080p max
10–20 seconds if used as a preview loop
under 25MB if possible
```

---

# Quick GitHub upload checklist

When you update the site:

1. Upload new images/videos to:

```txt
assets/images/
assets/videos/
```

2. Replace:

```txt
js/site-config.js
```

3. Commit changes.

4. Wait 1–3 minutes.

5. Open your site and hard refresh:

```txt
Ctrl + F5
```

---

# Do not edit these unless you know what you are doing

```txt
index.html
css/styles.css
js/app.js
```

For normal edits, use:

```txt
editor.html
js/site-config.js
```

The live site reads from:

```txt
js/site-config.js
```

That is the important file.


Update v14:
- Fixed editor inputs losing focus after each typed character.
- Project title/type/slug fields no longer rebuild the whole editor while typing.
- Undo history now debounces while typing, so normal typing feels smooth.


Update v15:
- Added Import Config to `editor.html`.
- You can now upload an old `site-config.js` or JSON config into the editor.
- This lets you continue editing in the future without redoing everything.
- Imported config is saved into browser preview storage automatically.
- After editing, download a fresh `site-config.js` and replace the one in GitHub.

Future editing workflow:
1. Open `editor.html`.
2. Click `Import config`.
3. Select your current `js/site-config.js` file.
4. Continue editing.
5. Click `Download config`.
6. Replace `js/site-config.js` on GitHub.
7. Commit changes.

This is useful if:
- you edit on a new browser
- you edit on a new PC
- browser storage gets cleared
- you want to keep working from the latest live site config


Update v16:
- Project media corners are now sharp (`border-radius: 0`).
- Removed project image/video hover movement and hover zoom.
- Images/videos now keep their natural aspect ratio on the site automatically.
- Added a project-limited lightbox for images and videos.
- Lightbox has blurred background, close button, left/right arrows, keyboard support, and swipe support.
- Left arrow hides on the first media item.
- Right arrow hides on the last media item.
- Captions are not shown in the lightbox.
- `editor.html` was left untouched from v15.


Update v17:
- Cursor now stays visible when the image/video lightbox is open.
- Lightbox videos no longer show browser controls.


Update v18:
- Fixed custom cursor layering.
- Cursor now appears normally above the lightbox and arrows.
- You can aim at/select the lightbox arrows with the cursor visible.


Update v19:
- Lightbox videos now do not autoplay.
- Videos start only after pressing a custom play button.
- Browser video controls are still hidden.
- Video cannot be paused by clicking the video or using default controls.
- When the video ends, the play button returns.


Update v20:
- Removed all borders/outlines from project images and videos.
- Lightbox media also has no border.


## v17 update

- Fixed the Projects media arrangement.
- First image/video is now a clean wide hero tile.
- Remaining images line up as equal polished thumbnails instead of uneven messy blocks.
- Mobile stacks the project media cleanly.


## YouTube + MP4 videos

Project videos now support both local MP4 files and YouTube links.

Use either:

```js
{ kind: "video", path: "assets/videos/project-video.mp4" }
```

or:

```js
{ kind: "video", path: "https://youtu.be/YOUR_VIDEO_ID" }
```

Videos are automatically displayed after all project images as a large full-width showcase piece.


## YouTube preview note

If you open `index.html` directly from your PC with `file://`, YouTube may block iframe playback and show Error 153. This fixed version avoids the broken player locally and shows a clean YouTube open button instead. On GitHub Pages or localhost, the normal embedded YouTube player loads.

For local embedded preview, run a small server inside the folder:

```txt
python -m http.server 8000
```

Then open:

```txt
http://localhost:8000
```


## About image upload in editor

The editor now has an **Upload about image** field beside the About portrait path. Picking a file sets the path to `assets/images/your-file-name`. For GitHub Pages, upload that image manually into `assets/images`, same as project images.


## Update: About upload + Capabilities nav

- Fixed the editor About image upload input so it updates `about.portrait.path`.
- The About image now uses the same workflow as project media: pick the file, then upload it to `assets/images/`.
- Added `/Capabilities` to the desktop navbar and mobile menu.
- Added `Capabilities` to `js/site-config.js` navigation using `#services`.


## YouTube embed fix

This build uses the standard `youtube.com/embed/...` player instead of `youtube-nocookie.com/embed/...` because some videos can throw `Video unavailable` on the privacy-enhanced domain. Use Public or Unlisted YouTube videos with embedding allowed.
