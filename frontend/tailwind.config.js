/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    // bg
    "bg-gray-100","bg-gray-900","bg-indigo-900","bg-gray-800",
    "bg-white","bg-emerald-500","bg-emerald-600",
    "bg-gray-200","hover:bg-gray-200","hover:bg-emerald-600",
    
    // text
    "text-gray-900","text-indigo-900","text-gray-200","text-gray-400","text-gray-600","text-white",
    "text-teal-400","hover:text-indigo-900",
    
    // border
    "border-white","border-gray-300"
  ],
  theme: { extend: {} },
  plugins: [],
};

