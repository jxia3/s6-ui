import { Main } from "./fonts.js"
import StyledJsxRegistry from "./registry.js"

import "./global.css"
import styles from "./styles.module.css"
import "highlight.js/styles/vs.css"

// Global layout

const RootLayout = ({ children }) => (
    <html lang="en" className={Main.className}>
        <body>
            <div className={styles.center}>
                <div className={styles.content}>
                    <StyledJsxRegistry>{children}</StyledJsxRegistry>
                </div>
                <div className={styles.footer}>
                    Research by&nbsp;
                    <a className={styles["footer-link"]} href="https://cs.brown.edu/~spr/research/s6.html" target="_blank">Steven P. Reiss</a>,
                    frontend by&nbsp;
                    <a className={styles["footer-link"]} href="https://github.com/jxia3" target="_blank">Jerry Xia</a>
                    <a className={styles["repo-link"]} href="https://github.com/jxia3/s6-ui" target="_blank">
                        <img className={styles["repo-icon"]} src="/github.svg"></img>
                    </a>
                </div>
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