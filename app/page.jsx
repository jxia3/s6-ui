import Link from "next/link"
import styles from "./styles.module.css"

const SearchLink = ({ text, type }) => (
    <Link className={styles.link} href={`/search?type=${type}`}>
        {text}
    </Link>
)

const Home = () => (
    <div className={styles.landing}>
        <h1 className={styles.title}>
            S
            <div className={styles["title-top"]}>6</div>
        </h1>
        <p className={styles.desc}>
            S6 is a utility for semantically searching for Java methods and classes in a global open-source code database. The search engine uses keywords and tests to narrow results and find specific code that fits the desired conditions. S6 is a tool for programmers to find relevant code that can be adapted to their use cases.
        </p>
        <div className={styles.start}>
            Start searching for
            <SearchLink text="METHODS" type="method" />
        </div>
    </div>
)

export default Home