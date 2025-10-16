# 🎨 Webpage Customization Guide

This guide shows you how to customize the appearance of your election map website.

---

## 📁 Files to Edit

### For the Interactive Map Version (`/docs/`)

| File | What It Controls |
|------|------------------|
| **`docs/style.css`** | All visual styling (colors, fonts, spacing, layout) |
| **`docs/script.js`** | Map state colors, hover effects, tooltip content |
| **`docs/index.html`** | Page structure and text content |

### For the List View Version (`/web/`)

| File | What It Controls |
|------|------------------|
| **`web/style.css`** | All visual styling for list view |
| **`web/script.js`** | Data loading and card generation |
| **`web/index.html`** | Page structure for list view |

---

## 🎨 Common Customizations

### 1. Change Header Colors

**File:** `docs/style.css` (line ~28) or `web/style.css` (line ~46)

```css
/* Current: Purple gradient */
background: linear-gradient(135deg, #5a189a 0%, #7209b7 50%, #9d4edd 100%);

/* Red gradient */
background: linear-gradient(135deg, #c1121f 0%, #e63946 50%, #f77f00 100%);

/* Blue gradient */
background: linear-gradient(135deg, #1d3557 0%, #457b9d 50%, #a8dadc 100%);

/* Green gradient */
background: linear-gradient(135deg, #2d6a4f 0%, #40916c 50%, #52b788 100%);

/* Solid color (no gradient) */
background: #1d3557;
```

### 2. Change Map State Colors

**File:** `docs/script.js` (lines 63-64)

```javascript
// Current setup:
let fill = '#e8f5f7'; // Very light blue for states WITHOUT elections
if (hasElections) fill = '#1d3557'; // Dark blue for states WITH elections

// Example: Make active states green
let fill = '#e8f5f7'; 
if (hasElections) fill = '#2d6a4f'; // Dark green

// Example: Make active states red
let fill = '#f8f9fa'; 
if (hasElections) fill = '#e63946'; // Red
```

### 3. Color States by Election Type

**File:** `docs/script.js` (lines 58-75)

Replace the existing color logic with this:

```javascript
const stateSpecificStyles = {};
const stateSpecificHoverStyles = {};

for (const abbr in electionData) {
  const s = electionData[abbr];
  
  // Check what types of elections exist
  const hasHouse = (s.elections || []).some(e => e.chamberImpact === 'House');
  const hasState = (s.elections || []).some(e => e.chamberImpact === 'State');
  const hasLocal = (s.elections || []).some(e => e.chamberImpact === 'Local');
  
  let fill = '#e8f5f7'; // Default light blue
  if (hasHouse) fill = '#e63946';      // Red for House elections
  else if (hasState) fill = '#457b9d'; // Medium blue for State elections
  else if (hasLocal) fill = '#a8dadc'; // Light blue for Local elections
  
  stateSpecificStyles[abbr] = { 
    fill,
    'stroke-width': 2,
    'filter': 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
  };
  
  stateSpecificHoverStyles[abbr] = { 
    fill: '#1d3557',
    'stroke-width': 3,
    'filter': 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
  };
}
```

### 4. Color States by Number of Elections

**File:** `docs/script.js` (lines 58-75)

Replace the existing color logic with this:

```javascript
const stateSpecificStyles = {};
const stateSpecificHoverStyles = {};

for (const abbr in electionData) {
  const s = electionData[abbr];
  const numElections = (s.elections || []).length;
  
  // Gradient from light to dark based on number of elections
  let fill = '#e8f5f7';              // 0 elections - very light blue
  if (numElections === 1) fill = '#a8dadc';      // 1 election - light blue
  else if (numElections === 2) fill = '#457b9d'; // 2 elections - medium blue
  else if (numElections >= 3) fill = '#1d3557';  // 3+ elections - dark blue
  
  stateSpecificStyles[abbr] = { 
    fill,
    'stroke-width': 2,
    'filter': 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
  };
  
  stateSpecificHoverStyles[abbr] = { 
    fill: '#e63946', // Red on hover
    'stroke-width': 3,
    'filter': 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
  };
}
```

### 5. Change Fonts

**File:** `docs/style.css` (line 12)

```css
/* Current font */
font-family: Verdana, Geneva, Tahoma, sans-serif;

/* Modern system fonts */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Serif font */
font-family: Georgia, "Times New Roman", serif;

/* Monospace font */
font-family: "Courier New", Courier, monospace;
```

### 6. Change Header Size

**File:** `docs/style.css` (line 34)

```css
/* Current size */
font-size: 48px;

/* Larger */
font-size: 64px;

/* Smaller */
font-size: 36px;
```

### 7. Change Badge Colors (List View)

**File:** `web/style.css` (lines 81-96)

```css
/* Local election badge */
.badge.local { 
  background: #a8dadc;  /* Change background color */
  color: #1d3557;       /* Change text color */
}

/* State election badge */
.badge.state { 
  background: #457b9d; 
  color: white; 
}

/* House election badge */
.badge.house { 
  background: #e63946; 
  color: white; 
}

/* Referendum badge */
.badge.ref { 
  background: #1d3557; 
  color: white; 
}
```

---

## 🔍 CSS Variable Reference

At the top of both CSS files, you'll find color variables:

```css
:root {
  --red-pantone: #e63946;      /* Bright red */
  --honeydew: #f1faee;          /* Soft off-white */
  --non-photo-blue: #a8dadc;    /* Light blue */
  --cerulean: #457b9d;          /* Medium blue */
  --berkeley-blue: #1d3557;     /* Dark blue */
}
```

You can use these anywhere in CSS with `var(--variable-name)`:
```css
color: var(--cerulean);
background: var(--berkeley-blue);
```

---

## 🎯 Quick Color Reference

### Suggested Color Palettes

**🔴 Red Theme:**
- Header: `linear-gradient(135deg, #c1121f 0%, #e63946 50%, #f77f00 100%)`
- Active states: `#e63946`
- Inactive states: `#ffe5e5`

**🟢 Green Theme:**
- Header: `linear-gradient(135deg, #2d6a4f 0%, #40916c 50%, #52b788 100%)`
- Active states: `#2d6a4f`
- Inactive states: `#e8f5e9`

**🟣 Purple Theme (Current):**
- Header: `linear-gradient(135deg, #5a189a 0%, #7209b7 50%, #9d4edd 100%)`
- Active states: `#7209b7`
- Inactive states: `#f3e5f5`

**🟠 Orange Theme:**
- Header: `linear-gradient(135deg, #e85d04 0%, #f77f00 50%, #faa307 100%)`
- Active states: `#dc2f02`
- Inactive states: `#fff3e0`

---

## 💡 Tips

1. **Test changes:** After editing, save the file and refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. **Small changes first:** Start with simple color changes before modifying layout
3. **Use browser DevTools:** Right-click → Inspect to experiment with CSS live
4. **Keep backups:** Save a copy of files before making major changes
5. **Check both views:** Remember to update both `/docs/` (map) and `/web/` (list) if you want them to match

---

## 🛠️ Testing Your Changes

1. Save your edited files
2. Make sure the local server is running: `python3 -m http.server 8080`
3. Open http://localhost:8080/ in your browser
4. Hard refresh: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac)

---

## ❓ Need More Help?

All CSS files now have detailed comments explaining what each section does. Look for comments like:

```css
/* ========================================
   SECTION NAME
   ========================================
   Description of what this section controls
*/
```

In JavaScript files, look for comments explaining the color logic and customization options.

