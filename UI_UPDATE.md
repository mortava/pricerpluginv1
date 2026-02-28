---

### LAYOUT — MOBILE (<1024px)

#### HIDE sidebar entirely (`hidden lg:block` on sidebar)

#### MOBILE HEADER (replaces current header, `lg:hidden`)
```html
<header class="sticky top-0 z-50 bg-white/92 backdrop-blur-2xl border-b border-slate-100 px-4 h-14 flex items-center justify-between lg:hidden">
  <div class="font-['DM_Sans'] text-[17px] font-bold text-slate-900 flex items-center gap-1.5">
    MyPrice <span class="bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">AI</span>
  </div>
  <div class="flex items-center gap-2.5">
    <div class="w-[30px] h-[30px] rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-semibold">JD</div>
    <button aria-label="Toggle menu" class="w-[34px] h-[34px] flex items-center justify-center rounded-lg">
      <!-- hamburger icon (3 lines) -->
    </button>
  </div>
</header>
```

#### MOBILE SLIDE-OUT MENU (hamburger)
Right-side drawer, 280px wide. Opens with overlay + slide animation.
```html
<!-- Overlay -->
<div class="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm transition-opacity" />

<!-- Drawer -->
<div class="fixed top-0 right-0 bottom-0 z-[201] w-[280px] bg-white shadow-xl transition-transform translate-x-full [&.open]:translate-x-0 flex flex-col">
  
  <!-- Header -->
  <div class="px-5 py-4 flex items-center justify-between border-b border-slate-100">
    <div class="font-['DM_Sans'] text-[17px] font-bold">MyPrice <span class="badge">AI</span></div>
    <button class="w-[30px] h-[30px] rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">✕</button>
  </div>
  
  <!-- TOOLS (on top) -->
  <div class="px-3 pt-4 pb-2">
    <div class="px-2 pb-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Tools</div>
    <a class="block px-4 py-3 rounded-[10px] text-[14px] font-medium text-slate-600">AI Deal Desk</a>
    <a class="block px-4 py-3 rounded-[10px] text-[14px] font-medium text-slate-600">Pipeline</a>
    <a class="block px-4 py-3 rounded-[10px] text-[14px] font-medium text-slate-600">AVM</a>
    <a class="block px-4 py-3 rounded-[10px] text-[14px] font-medium text-slate-600">AUS</a>
  </div>
  
  <!-- SECTIONS (below tools) -->
  <div class="px-3 pt-2 pb-2">
    <div class="px-2 pb-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Sections</div>
    <a class="block px-4 py-3 rounded-[10px] text-[14px] font-semibold text-slate-900 bg-slate-50 border-l-[3px] border-blue-500">Loan Information</a>
    <a class="block px-4 py-3 rounded-[10px] text-[14px] font-medium text-slate-600">Property Details</a>
    <a class="block px-4 py-3 rounded-[10px] text-[14px] font-medium text-slate-600">Borrower Details</a>
    <a class="block px-4 py-3 rounded-[10px] text-[14px] font-medium text-slate-600">Investor Details</a>
    <a class="block px-4 py-3 rounded-[10px] text-[14px] font-medium text-slate-600">Additional Details</a>
  </div>
  
  <!-- Spacer + Sign Out -->
  <div class="flex-1" />
  <div class="px-5 py-4 border-t border-slate-100">
    <button class="w-full py-3 rounded-[10px] bg-slate-50 border border-slate-200 text-[14px] font-medium text-slate-500 text-center">Sign Out</button>
  </div>
</div>
```

Section links in the menu should scroll to the corresponding section ID and close the menu.
**NO emoji icons** on any menu items — clean text only.

#### MOBILE FORM LAYOUT
- Remove the card wrapper (`rounded-lg border shadow-sm`) — content sits directly on white bg
- Padding: `px-4 py-4 pb-24`
- **ALL fields stack single-column** — `grid-cols-1` (NOT 2-column on mobile)
- Fields gap: `gap-4`
- Input font-size: `16px` (prevents iOS zoom on focus)
- Input height: `46px` (larger tap targets)
- Page title: DM Sans 20px/700

#### MOBILE STICKY CTA
```html
<div class="fixed bottom-0 left-0 right-0 z-40 bg-white/88 backdrop-blur-2xl border-t border-slate-100/80 px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
  <button class="w-full bg-slate-900 text-white rounded-xl h-12 text-[15px] font-semibold active:scale-[0.98] transition-transform">
    Get Pricing
  </button>
  <div class="text-[10px] text-slate-400 text-center mt-1.5">All required fields must be filled</div>
</div>
```

---

### WHAT TO REMOVE
1. The gray page background (`bg-gray-50` / `#FAFAFA` on body) → make it `bg-white`
2. The card wrapper around the form (`rounded-lg border border-gray-200 bg-white shadow-sm`) → remove entirely
3. The card header with "Loan Details" icon inside the card → move "Loan Details" to top bar
4. The `bg-blue-50` investor section special background → make it match all other sections
5. The `text-blue-700` on Investor Details heading → use same color as all headings
6. The uppercase `tracking-wide` section headings → title case, normal tracking
7. Border-bottom separators between sections (`border-b`) → use spacing/whitespace instead
8. The full-width blue gradient "Get Pricing" button at bottom of card → replace with sticky CTA bar
9. The old mobile hamburger dropdown → replace with slide-out drawer

### WHAT TO KEEP
1. ALL field names, labels, dropdown options, values, and mappings — ZERO changes
2. ALL form validation logic and required field indicators
3. ALL conditional field visibility (e.g., DSCR fields appearing for DSCR doc type)
4. The existing combobox/select component behavior (just restyle the trigger)
5. The Additional Details collapsible section
6. The LTV auto-calculation and DSCR auto-calculation
7. ALL API calls, state management, and form submission logic
8. The nav links (AI Deal Desk, Pipeline, AVM, AUS) pointing to app.defywholesale.com
9. Sign Out functionality

### IMPLEMENTATION ORDER
1. Add Google Fonts (DM Sans + Inter) to index.html
2. Update tailwind.config.js with new font families and any custom colors
3. Create Sidebar component (desktop only, `hidden lg:flex`)
4. Create MobileHeader component with hamburger + SlideOutMenu
5. Create StickyCtaBar component (replaces inline submit button)
6. Update the main layout wrapper — add sidebar offset, remove card wrapper
7. Update global input/select/label CSS to underline style
8. Update each form section — remove borders, update heading styles
9. Update checkbox components to card-style
10. Update DSCR display component
11. Remove Investor Details special styling
12. Test responsive breakpoints (mobile single-col, desktop 2-col with sidebar)