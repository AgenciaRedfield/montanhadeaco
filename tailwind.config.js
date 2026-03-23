export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            colors: {
                brass: {
                    50: "#fdf8ea",
                    100: "#f6e7b1",
                    200: "#ebcb71",
                    300: "#d2a645",
                    400: "#bb8330",
                    500: "#9b6221",
                    600: "#76471a",
                    700: "#573015",
                    800: "#381d10",
                    900: "#1d0d08"
                },
                copper: {
                    300: "#f0b18b",
                    400: "#d88a63",
                    500: "#be653d",
                    600: "#8d4326",
                    700: "#5d2715"
                },
                smoke: {
                    50: "#e9ecef",
                    100: "#c7ccd4",
                    200: "#9fa6b2",
                    300: "#757d8c",
                    400: "#555c69",
                    500: "#383d46",
                    600: "#252933",
                    700: "#191c24",
                    800: "#101219",
                    900: "#08090d"
                }
            },
            boxShadow: {
                copper: "0 0 30px rgba(190, 101, 61, 0.25)",
                insetPanel: "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 0 0 1px rgba(191,140,88,0.18)"
            },
            fontFamily: {
                display: ["Cormorant Garamond", "Baskerville", "serif"],
                body: ["Rajdhani", "Trebuchet MS", "sans-serif"]
            },
            backgroundImage: {
                "steel-grid": "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)"
            },
            keyframes: {
                steam: {
                    "0%, 100%": { transform: "translateY(0) scale(1)", opacity: "0.4" },
                    "50%": { transform: "translateY(-10px) scale(1.08)", opacity: "0.8" }
                },
                ember: {
                    "0%, 100%": { opacity: "0.5", transform: "scale(1)" },
                    "50%": { opacity: "1", transform: "scale(1.12)" }
                }
            },
            animation: {
                steam: "steam 6s ease-in-out infinite",
                ember: "ember 2.4s ease-in-out infinite"
            }
        }
    },
    plugins: []
};
