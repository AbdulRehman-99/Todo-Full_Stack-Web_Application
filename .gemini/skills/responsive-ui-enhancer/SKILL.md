---
name: responsive-ui-enhancer
description: This skill will be used to make my full-stack AI-powered Todo app fully responsive across mobile, tablet, and desktop.
---

# Responsive UI Enhancer

## Overview

This skill is designed to guide the AI agent in transforming the frontend UI of the AI-powered Todo app to be fully responsive. The focus is strictly on UI/UX improvements for various screen sizes (mobile, tablet, desktop) without altering any backend logic, API calls, authentication mechanisms, database interactions, or core agent functionalities.

## Workflow

The agent will systematically audit and refactor the frontend codebase to implement responsive design principles using Tailwind CSS. This involves a mobile-first approach, strategic application of responsive utility classes, and thorough validation across specified breakpoints.

## Instructions

To enhance the responsiveness of the AI-Todo-Full-Stack-App frontend, follow these step-by-step instructions:

1.  **Audit Frontend**: Conduct a comprehensive audit of the entire frontend codebase (`Frontend/` directory) for:
    *   Any fixed pixel widths (`w-px`, `h-px`, etc.) or non-responsive dimensions.
    *   Elements causing horizontal scrolling or overflow issues.
    *   Components that do not adapt well to various screen sizes.

2.  **Convert to Mobile-First Approach**: Ensure all styling defaults to mobile layouts, and responsive classes (`sm:`, `md:`, `lg:`, `xl:`) are used to progressively enhance the layout for larger screens.

3.  **Replace Hard-Coded Widths**: Convert any hard-coded, non-responsive widths or heights (e.g., `w-96`, `h-48`) to fluid alternatives or responsive `max-width` utilities (e.g., `max-w-md`, `max-w-full`).

4.  **Implement Flexbox Patterns**: Where applicable, replace static layouts with responsive flexbox patterns:
    *   Use `flex-col` for vertical stacking on mobile.
    *   Transition to `md:flex-row` for horizontal layouts on medium screens and above.
    *   Ensure appropriate `gap-` utilities are used for spacing.

5.  **Apply Grid Layouts**: For multi-column layouts, use responsive grid utilities:
    *   Default to `grid-cols-1` on mobile.
    *   Progressively enhance to `md:grid-cols-2` on medium screens.
    *   Further enhance to `lg:grid-cols-3` or similar on large screens.
    *   Use `gap-` utilities for consistent spacing between grid items.

6.  **Text Responsiveness**:
    *   Ensure text content uses `break-words` or `break-all` where necessary to prevent overflow.
    *   Apply `truncate` judiciously for long titles or descriptions that might cause layout shifts.

7.  **Container Padding**: Standardize and fix container padding using responsive `px-` utilities, such as `px-4 sm:px-6 md:px-8` for consistent spacing across different breakpoints.

8.  **Chat UI Responsiveness**: Specifically ensure the ChatKit container and its contents (messages, input area) adapt seamlessly to varying screen sizes, maintaining usability and aesthetic on all devices. This includes vertical scrolling for chat history and a flexible input area.

9.  **Test Breakpoints**: Manually test the UI at key breakpoints:
    *   **375px** (common mobile width)
    *   **768px** (common tablet width)
    *   **1024px** (common desktop width)
    *   Confirm that elements reflow correctly and content remains readable and accessible.

10. **Confirm No Horizontal Scrolling**: After all changes, verify that no horizontal scrolling appears at any screen width, indicating proper overflow handling.

11. **Maintain Logic Integrity**: STRICTLY ensure that all frontend logic, state management, and API calls remain untouched. Only modify UI/CSS-related code.

## Tailwind Responsive Strategy

*   **Mobile-First**: Design and style for the smallest screen first, then use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) to adapt for larger screens.
*   **Utility-First**: Leverage Tailwind's extensive utility classes for granular control over layout, spacing, typography, and component appearance.
*   **Flexbox & Grid**: Utilize `flex`, `grid`, and their responsive variants (`flex-col`, `md:flex-row`, `grid-cols-1`, `lg:grid-cols-3`) for dynamic layouts.
*   **Max-Width Utilities**: Prefer `max-w-*` over fixed widths to ensure elements don't stretch excessively on large screens but can shrink on small ones.
*   **Spacing**: Maintain a consistent visual rhythm using Tailwind's spacing scale (`p-*`, `m-*`, `gap-*`).

## Chat UI Responsiveness Rules

*   The chat widget/container must utilize responsive width and height utilities to occupy appropriate screen real estate.
*   Chat message bubbles should wrap content naturally and adjust font sizes responsively.
*   The chat input area should be flexible and prevent overflow, possibly using `max-h-` for scrollable input on mobile if text grows too long.
*   The chat history must be vertically scrollable, with `overflow-y-auto` or similar properties, and occupy the available vertical space.

## Manual CRUD UI Responsiveness Rules

*   Task listing should display gracefully, potentially adapting from a multi-column view on desktop to a single-column stack on mobile.
*   Task forms (add/edit) should have full-width inputs on mobile and scale appropriately on larger screens.
*   Buttons (Edit, Delete, Add Task, Filter) should be touch-friendly and adjust their size/placement to prevent cramping on small screens. Consider stacking buttons vertically on mobile if horizontal space is limited.
*   Cards (`card` class) should maintain internal padding and flex appropriately within their parent containers.

## Navbar/Header Rules

*   The Header component must implement a responsive navigation pattern (e.g., hamburger menu for mobile, full navigation for desktop).
*   Brand logo and title should remain visible and appropriately sized across all breakpoints.
*   Navigation links should adapt their display from horizontal to vertical or be hidden behind a toggle on smaller screens.

## Validation Checklist

*   [ ] Frontend fully renders without horizontal scrollbars at 375px, 768px, and 1024px.
*   [ ] All interactive elements (buttons, inputs) are easily tappable/clickable on mobile.
*   [ ] Text content is legible and does not overflow containers at any breakpoint.
*   [ ] Images and media scale responsively.
*   [ ] Chat UI remains fully functional and aesthetically pleasing across all tested breakpoints.
*   [ ] CRUD interfaces are intuitive and usable on mobile, tablet, and desktop.
*   [ ] No backend, API, or authentication code has been modified.
*   [ ] No new features have been added or existing features removed.

## Constraints

*   **Technology Stack**: Frontend exclusively uses Next.js, React, TypeScript, and Tailwind CSS.
*   **No Logic Changes**: Absolutely no modifications to backend, API, authentication, database logic, or AI agent implementation.
*   **No New Features**: The scope is limited to UI responsiveness; no new functionalities are to be introduced.
*   **Folder Structure**: The existing folder structure of the project must be preserved.
*   **Performance**: Responsive changes should not introduce significant performance regressions.

## Deliverables

*   Updated frontend files within the `Frontend/` directory, specifically `.tsx` and `.css` files, reflecting responsive UI enhancements.
*   A fully responsive UI that adapts gracefully to mobile (375px), tablet (768px), and desktop (1024px) screen sizes.
*   Confirmation that the validation checklist items are met.
