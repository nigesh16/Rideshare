/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
     // Backgrounds
  "bg-indigo-900",
  "bg-emerald-500",
  "bg-emerald-600",
  "bg-white",
  "bg-gray-100",
  "bg-gray-900",
  "bg-gray-800",
  "dark:bg-gray-700",

  // Text
  "text-white",
  "text-indigo-900",
  "text-gray-200",
  "text-gray-600",
  "text-gray-400",
  "text-teal-400",

  // Hover states
  "hover:bg-emerald-600",
  "hover:bg-gray-200",
  "hover:text-indigo-900",
  "hover:underline",
  "hover:bg-emerald-600",
  "dark:hover:bg-emerald-600",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
