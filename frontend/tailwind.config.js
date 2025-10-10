/** @type {import('tailwindcss').Config} */
module.exports = { // <-- add this
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // bg
    "bg-gray-100","bg-gray-900","bg-indigo-900","bg-gray-800",
    "bg-white","bg-emerald-500","bg-emerald-600","dark:bg-gray-700",
    "dark:bg-gray-800","dark:bg-teal-400","bg-gray-200",
    "hover:bg-gray-200","hover:bg-emerald-600","dark:hover:bg-emerald-600",
    
    // text
    "text-gray-900","dark:text-white","text-indigo-900","text-gray-200",
    "dark:text-gray-300","text-gray-400","text-gray-600","text-white",
    "text-teal-400","hover:text-indigo-900",
    
    // border
    "border-white","border-gray-300","dark:border-gray-700"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

