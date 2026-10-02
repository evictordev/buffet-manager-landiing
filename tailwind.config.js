/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta derivada do próprio produto (fundo navy, índigo e verde dos cards)
        paper: "#0b0c22",
        ink: "#f1f2fa",
        muted: "#9a9db6",
        night: "#06061c",
        "night-2": "#101128",
        accent: "#8b93ff",
        emerald: "#10b981",
        line: "rgba(255,255,255,0.10)",
      },
      fontFamily: {
        sans: ['"Geist Variable"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        frame: "0 50px 100px -40px rgba(10,10,40,0.45), 0 18px 36px -18px rgba(10,10,40,0.3)",
        chip: "0 24px 48px -20px rgba(10,10,40,0.45)",
      },
    },
  },
  plugins: [],
};
