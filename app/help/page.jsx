import { Monospace } from "../fonts.js"
import styles from "./help.module.css"

// Help page content

const HelpPage = () => (
    <div className={styles["content-wrapper"]}>
        <div className={styles.content}>
            <h2 className={styles.header}>About</h2>
            <p className={styles.text + " " + styles["text-end"]}>
                S6 is a code search engine project created by Steven P. Reiss. This is an experimental new user interface that interacts
                with the server to provide search functionality. Access the original interface for all the legacy features at&nbsp;
                <a className={styles.link} href="http://conifer2.cs.brown.edu:8180/S6Search/s6search.html" target="_blank">
                    http://conifer2.cs.brown.edu:8180/S6Search/s6search.html
                </a>.
            </p>

            <h2 className={styles.header}>Method Search</h2>
            <p className={styles.text}>
                The method box lets you enter the signature, test cases, and other method specifications to search for a method in the
                SearchCode database.
            </p>
            <p className={styles.text}>
                Enter the signature of the method you want returned in the Declaration region. This should look something like
                <code className={styles.code + " " + Monospace.className}>int countLetters(String text, String letters)</code>
                where the variables names are optional. Type names assume java.lang, java.util, java.io, and other standard packages are
                included. If the user provides a context (see below), then types from the context are also permitted.
            </p>
            <p className={styles.text}>
                The input for test cases should look like an argument list, with the arguments separated by commas. For lists and arrays,
                the notation
                <code className={styles.code + " " + Monospace.className}>{"[<v1>, <v2>, ..., <vn>]"}</code>
                can be used. The second part of the test case is how to view the result. The default, ==, indicates that Java equals should
                be used. The longer === indicates that object identity should be used. Throws here indicates that the method should throw an
                exception. The final option indicates that the result value should be shown to the user rather than compared. The next part
                of the test case is the result value. For an throws test, this is the exception type.
            </p>
            <p className={styles.text + " " + styles["text-end"]}>
                The plus button to add options lets the user create a context that will be used for building and running the test cases. The
                context is specified by a jar file that is built by the Java web-start application that is run when the user selects the Create
                Context button. Contexts are most easily specified by defining the Eclipse workspace path and selecting an Eclipse project.
            </p>

            <h2 className={styles.header}>Test Case Selection</h2>
            <span className={styles.text}>
                When the {"<??>"} comparison operator is used in test cases, instead of specifying a specific output, you can choose which results
                from the method to include and exclude. After making a selection for each test case, the continue search button will find the results
                which match the allowed inputs discarding those that match the excluded outputs.
            </span>
        </div>
    </div>
)

export default HelpPage