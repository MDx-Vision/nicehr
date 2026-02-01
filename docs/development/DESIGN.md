# NICEHR Design System
## Apple-Inspired Design Specification

> "Design is not just what it looks like. Design is how it works." — Steve Jobs

---

## Core Principles

### 1. Less is More
- Remove everything that isn't essential
- If it doesn't serve the user's immediate goal, hide it
- White space is not wasted space—it's breathing room

### 2. Progressive Disclosure
- Show only what's needed now
- Reveal complexity on demand
- Primary action always visible, secondary actions tucked away

### 3. Clarity Over Cleverness
- Every element must have a purpose
- Labels should be self-explanatory
- No jargon, no acronyms, no ambiguity

### 4. Effortless Interaction
- One primary action per view
- Reduce clicks, reduce friction
- Make the right choice obvious

---

## Color Palette

### Light Mode (Default)
```css
--background: #FAFAFA;        /* Near-white, warm */
--foreground: #1D1D1F;        /* Apple's signature dark gray */
--card: #FFFFFF;              /* Pure white cards */
--border: #E5E5E7;            /* Subtle, barely there */
--muted: #86868B;             /* Secondary text */

--primary: #0071E3;           /* Apple blue - trust, action */
--primary-hover: #0077ED;     /* Slightly brighter on hover */

--success: #34C759;           /* Apple green */
--warning: #FF9500;           /* Apple orange */
--destructive: #FF3B30;       /* Apple red */
```

### Dark Mode
```css
--background: #000000;        /* True black for OLED */
--foreground: #F5F5F7;        /* Off-white text */
--card: #1C1C1E;              /* Elevated surface */
--border: #38383A;            /* Subtle separation */
--muted: #8E8E93;             /* Secondary text */

--primary: #0A84FF;           /* Vibrant blue for dark */
--success: #30D158;
--warning: #FF9F0A;
--destructive: #FF453A;
```

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 
             'SF Pro Text', 'Helvetica Neue', sans-serif;
```

### Scale
| Element | Size | Weight | Tracking |
|---------|------|--------|----------|
| Page Title | 34px | 700 | -0.02em |
| Section Header | 22px | 600 | -0.01em |
| Card Title | 17px | 600 | 0 |
| Body | 15px | 400 | 0 |
| Caption | 13px | 400 | 0 |
| Label | 12px | 500 | 0.02em |

### Rules
- Headlines: Bold, tight tracking
- Body: Regular weight, generous line-height (1.5)
- Never use ALL CAPS except for tiny labels
- Maximum 65 characters per line for readability

---

## Spacing & Layout

### Spacing Scale
```
4px  - Tight (between related elements)
8px  - Compact (within components)
16px - Standard (between components)
24px - Relaxed (between sections)
48px - Generous (page margins)
```

### Grid
- 12-column grid
- 24px gutters
- Max content width: 1200px
- Cards: 16px padding minimum

### Radius
```css
--radius-sm: 8px;   /* Buttons, inputs */
--radius-md: 12px;  /* Cards, modals */
--radius-lg: 16px;  /* Large containers */
--radius-full: 9999px; /* Pills, avatars */
```

---

## Components

### Buttons

**Primary** (One per view maximum)
- Background: var(--primary)
- Text: White
- Radius: 8px
- Padding: 12px 20px
- No shadows, no gradients
- Hover: Slight brightness increase

**Secondary**
- Background: transparent
- Border: 1px solid var(--border)
- Text: var(--foreground)
- Hover: Background var(--muted)/10%

**Ghost** (Tertiary actions)
- Background: transparent
- Text: var(--primary)
- Hover: Background var(--primary)/10%

### Cards
- Background: var(--card)
- Border: 1px solid var(--border)
- Radius: 12px
- Shadow: None in light mode, subtle in dark
- Padding: 20px
- No header backgrounds—use typography hierarchy

### Inputs
- Height: 44px (Apple's touch target)
- Border: 1px solid var(--border)
- Radius: 8px
- Focus: 2px ring in var(--primary)
- Placeholder: var(--muted)
- No floating labels—label above input

### Tables
- No zebra striping
- Horizontal borders only (1px var(--border))
- Row height: 52px minimum
- Hover: Background var(--muted)/5%
- Headers: 12px uppercase, var(--muted)

### Navigation
- Sidebar: 240px fixed width
- Active item: Background var(--primary)/10%, text var(--primary)
- Icons: 20px, stroke width 1.5
- No nested menus more than 2 levels deep

---

## Terminology (Apple Power Words)

Replace generic terms with intentional language:

| Instead of | Use |
|------------|-----|
| Users | People |
| Dashboard | Overview |
| Settings | Preferences |
| Delete | Remove |
| Create | Add |
| Submit | Save / Continue |
| Cancel | Go Back |
| Error | Something went wrong |
| Loading... | Just a moment... |
| Success | Done |
| Logout | Sign Out |
| Login | Sign In |
| Admin | Administrator |
| N/A | — |
| null/undefined | (leave blank) |

### Microcopy Principles
- Speak like a human, not a system
- Be helpful, not robotic
- Lead with verbs: "Add a project" not "Project creation"
- Positive framing: "Keep me signed in" not "Don't sign me out"

---

## Progressive Disclosure Rules

### Level 1: Always Visible
- Primary navigation
- Page title
- Primary action button
- Essential data (3-5 columns max in tables)

### Level 2: One Click Away
- Filters and search
- Secondary actions (Edit, Share)
- Additional data columns
- Form sections beyond basics

### Level 3: On Demand
- Advanced settings
- Bulk operations
- Export/Import
- Audit history
- Delete actions

### Implementation
- Use collapsible sections: "Show more" / "Show less"
- Use sheet/drawer for secondary flows
- Use modals sparingly—only for critical confirmations
- Never show empty states with just "No data"—always guide next action

---

## Motion & Animation

### Principles
- Motion should feel natural, not decorative
- Fast: 150ms for micro-interactions
- Normal: 250ms for transitions
- Slow: 400ms for page transitions

### Easing
```css
--ease-out: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);
```

### What to Animate
- State changes (hover, focus, active)
- Content appearing/disappearing
- Navigation transitions

### What NOT to Animate
- Initial page load
- Data in tables
- Form validation errors

---

## Empty States

Never show a blank page. Always provide:

1. **Icon** (subtle, 48px)
2. **Headline** (what's empty)
3. **Subtext** (why it matters)
4. **Action** (how to fix it)

Example:
```
[Icon: Folder]

No projects yet

Projects help you organize work and track progress.

[+ Add your first project]
```

---

## Accessibility

### Requirements
- Color contrast: 4.5:1 minimum (WCAG AA)
- Touch targets: 44px minimum
- Focus indicators: Always visible
- Screen reader: All interactive elements labeled
- Keyboard: Full navigation support

### Testing
- Tab through every page
- Test with VoiceOver/NVDA
- Verify color contrast with tools
- Test at 200% zoom

---

## File Naming

When creating new components:
```
components/
  ui/
    button.tsx      # Base component
    card.tsx
    input.tsx
  features/
    project-card.tsx    # Feature-specific
    consultant-avatar.tsx
```

---

## Implementation Priority

### Phase 1: Foundation (Login + Dashboard)
1. Update CSS variables in index.css
2. Redesign Login.tsx
3. Redesign Dashboard.tsx
4. Update AppSidebar.tsx

### Phase 2: Core Modules
5. Hospitals.tsx
6. Projects.tsx
7. Consultants.tsx

### Phase 3: Remaining Pages
8. All other pages following established patterns

---

## Review Checklist

Before shipping any UI change:

- [ ] Does it follow the color palette?
- [ ] Is typography hierarchy clear?
- [ ] Is there one obvious primary action?
- [ ] Are secondary actions tucked away?
- [ ] Does empty state guide the user?
- [ ] Is it accessible (contrast, focus, labels)?
- [ ] Does it work on mobile?
- [ ] Is the copy human and helpful?

---

*This document is the source of truth. When in doubt, simplify.*
