---
name: frontend-skill
description: Build frontend pages, layouts, reusable components, styling, and responsive websites. Use for UI development tasks.
---

# Frontend Development Skill

## Instructions

1. **Page & Layout Structure**
   - Use clean, semantic HTML structure
   - Organize layouts using flexbox or grid
   - Separate layout components from content components

2. **Components**
   - Build small, reusable, and composable components
   - Keep components focused on a single responsibility
   - Pass data via typed props (TypeScript)

3. **Styling**
   - Use utility-first styling (Tailwind CSS)
   - Maintain consistent spacing, colors, and typography
   - Avoid inline styles unless absolutely necessary

4. **Responsive Design**
   - Mobile-first approach (base styles = mobile)
   - Enhance layouts for tablet and desktop using breakpoints
   - Ensure layouts adapt gracefully to different screen sizes

5. **Accessibility**
   - Use semantic elements (`button`, `nav`, `header`, `main`)
   - Ensure keyboard navigation works
   - Provide accessible labels and focus states

## Best Practices
- Mobile experience is the baseline
- Avoid fixed widths and heights unless required
- Keep UI logic separate from business logic
- Reuse components instead of duplicating markup
- Test layouts on mobile, tablet, and desktop
- Prefer clarity and maintainability over complexity

## Example Structure
```tsx
<section className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
  <div className="flex-1">
    <h1 className="text-2xl font-bold md:text-3xl">
      Page Title
    </h1>
    <p className="text-muted-foreground">
      Supporting description text
    </p>
  </div>

  <button className="rounded-lg bg-primary px-4 py-2 text-white">
    Call to Action
  </button>
</section>
