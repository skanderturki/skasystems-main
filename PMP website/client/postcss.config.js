// Empty PostCSS config scoped to this project.
// Prevents Vite from walking up the directory tree and picking up the parent
// monorepo's Tailwind v3 PostCSS plugin, which would try (and fail) to process
// our Tailwind v4 CSS. Tailwind v4 is handled by @tailwindcss/vite (see vite.config.js),
// not by PostCSS, so no plugins are needed here.
export default { plugins: {} };
