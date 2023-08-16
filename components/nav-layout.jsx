import Link from "next/link"
import styles from "./layout.module.css"

// Navigation link for header

const NavLink = ({ text, link }) => (
    <Link className={styles.link} href={link}>
        {text}
    </Link>
)

// Navigation header layout

const NavLayout = ({ children }) => (
    <>
        <div className={styles.navbar}>
            <div className={styles.logo}>
                S
                <div className={styles["logo-top"]}>6</div>
            </div>
            <NavLink text="HOME" link="/" />
            <NavLink text="SEARCH" link="/search" />
            <NavLink text="HELP" link="/help" />
        </div>
        {children}
    </>
)

export default NavLayout