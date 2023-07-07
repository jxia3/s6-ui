import Link from "next/link"
import styles from "./search.module.css"

// Navigation link for search page

const NavLink = ({ text, link }) => (
    <Link className={styles.link} href={link}>
        {text}
    </Link>
)

// Search page layout

const SearchLayout = ({ children }) => (
    <>
        <div className={styles.navbar}>
            <div className={styles.logo}>
                S
                <div className={styles["logo-top"]}>6</div>
            </div>
            <NavLink text="HOME" link="/" />
        </div>
        {children}
    </>
)

export default SearchLayout