# Color Palette Applied 🎨

Your custom color palette has been applied to the election map webpages!

## Color Variables

```css
--red-pantone: #e63946       /* Vibrant red - Used for House elections, alerts, hover accents */
--honeydew: #f1faee          /* Soft off-white - Main background color */
--non-photo-blue: #a8dadc    /* Light blue - Borders, Local elections, accents */
--cerulean: #457b9d          /* Medium blue - State elections, links, borders */
--berkeley-blue: #1d3557     /* Dark blue - Headers, text, hover states */
```

## Color Usage Map

### Page Elements
- **Background**: Honeydew (#f1faee)
- **Main text**: Berkeley Blue (#1d3557)
- **Headers**: Purple gradient (from #5a189a to #7209b7 to #9d4edd)
- **Links**: Cerulean (hover: Red Pantone)

### Map States
- **States with Elections**: Berkeley Blue (#1d3557) - Dark blue
- **States without Elections**: Very Light Blue (#e8f5f7) - Almost honeydew
- **Hover State**: Cerulean (#457b9d) - Medium blue
- **Default States**: Very Light Blue (#e8f5f7)
- **Borders**: Berkeley Blue strokes

### Cards & Components
- **Card backgrounds**: White
- **Card borders**: Cerulean (#457b9d)
- **Status boxes**: White with Non-photo Blue borders
- **Tooltips**: Berkeley Blue background, white text
- **Modal overlays**: Berkeley Blue with transparency

### Badges (in /web version)
- **Local**: Non-photo Blue background
- **State**: Cerulean background (white text)
- **House**: Red Pantone background (white text)
- **Referendums**: Berkeley Blue background (white text)

## Files Updated

✅ `/docs/style.css` - Main interactive map styling
✅ `/docs/script.js` - Map state colors  
✅ `/web/style.css` - List view styling

## View Your Updated Site

**🔗 http://localhost:8080/**

The color palette creates a cohesive, professional look with:
- 💜 Bold purple gradient header for visual impact
- 🔵 Very light blue (almost honeydew) for all states, dark blue for states with active elections
- ⚪ Clean white/honeydew backgrounds for readability

Refresh your browser to see the new colors!

