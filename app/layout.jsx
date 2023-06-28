import { Main } from "./fonts.js"

const RootLayout = ({ children }) => (
    <html lang="en" className={Main.className}>
        <body>{children}</body>
    </html>
)

export const metadata = {
    title: "S6 Search",
    description: "A utility for semantics-based code search",
}
export default RootLayout