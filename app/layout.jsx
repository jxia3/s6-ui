import { Main } from "./fonts.js"
import StyledJsxRegistry from "./registry.js"
import "./global.css"
import styles from "./styles.module.css"

// Global layout

const RootLayout = ({ children }) => (
    <html lang="en" className={Main.className}>
        <body className={styles.center}>
            <div className={styles.content}>
                <StyledJsxRegistry>{children}</StyledJsxRegistry>
            </div>
        </body>
    </html>
)

// Site metadata

export const metadata = {
    title: "S6 Search",
    description: "A utility for semantics-based code search",
}

export default RootLayout