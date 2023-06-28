import { Inter, IBM_Plex_Mono } from "next/font/google"

export const Main = Inter({
    subsets: ["latin"],
    display: "swap",
})

export const Monospace = IBM_Plex_Mono({
    subsets: ["latin"],
    display: "swap",
    weight: "400",
})