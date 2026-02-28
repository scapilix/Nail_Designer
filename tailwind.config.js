/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--primary))",
          light: "rgb(var(--primary-light))",
          dark: "rgb(var(--primary-dark))",
        },
        secondary: "rgb(var(--secondary))",
        card: "rgb(var(--bg-card))",
        "bg-main": "rgb(var(--bg-main))",
        "border-main": "rgb(var(--border-main))",
        muted: "rgb(var(--text-muted))",
        main: "rgb(var(--text-main))",
        dark: {
          DEFAULT: "rgb(var(--dark))",
        },
        accent: "rgb(var(--accent))",
        sidebar: "rgb(var(--nav-bg))",
      },
      fontFamily: {
        serif: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in": "slideIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
