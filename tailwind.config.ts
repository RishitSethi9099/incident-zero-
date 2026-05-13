import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        alarmPulse: {
          "0%, 100%": { opacity: "0.02" },
          "50%": { opacity: "0.06" },
        },
      },
      animation: {
        "alarm-pulse": "alarmPulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
