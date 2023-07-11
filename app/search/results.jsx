import LoadingRing from "../../components/loading-ring.jsx"
import hljs from "highlight.js"
import { useEffect } from "react"

// Ignore highlight.js XSS warning

hljs.configure({
    ignoreUnescapedHTML: true,
})

// Search state enum

const SearchState = {
    NONE: 0,
    VALIDATING: 1,
    SEARCHING: 2,
    ERROR: 3,
}

// Code results list component

const CodeResults = ({ results }) => {
    // Run highlight.js on code blocks

    useEffect(() => {
        hljs.highlightAll()
    }, [])

    return (
        <>
            <div className="results">
                {results.map(result => (
                    <div
                        className="result"
                        key={result?.TRANSFORMS?.TRANSFORM ?
                                typeof result.TRANSFORMS.TRANSFORM === "string" ?
                                    result.SOLSRC + "-" + result.TRANSFORMS.TRANSFORM :
                                    result.SOLSRC + "-" + result.TRANSFORMS.TRANSFORM.join("-") :
                                result.SOLSRC}
                    >
                        <h3 className="title">{result.NAME}</h3>
                        <pre className="code">
                            <code className="content language-java">
                                {result.CODE}
                            </code>
                        </pre>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .results {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: flex-start;
                }

                .result {
                    width: 100%;
                    border-top: 1px solid #888888;
                    padding: 20px 0;
                }

                .result:last-of-type {
                    border-bottom: 1px solid #888888;
                }

                .title {
                    font-weight: normal;
                }

                .code {
                    margin: 15px 0;
                }

                .content {
                    background-color: var(--fill) !important;
                    padding: 1rem !important;
                    border-radius: 4px !important;
                }
            `}</style>
        </>
    )
}

// Search result list

const SearchResults = ({ searchState, result }) => {
    // Get display message from enum
    
    function getSearchMessage(searchState) {
        if (searchState === SearchState.VALIDATING) {
            return "Validating tests"
        } else if (searchState === SearchState.SEARCHING) {
            return "Searching"
        } else if (searchState === SearchState.ERROR) {
            if (result?.error) {
                return "Search error: " + result.error
            }
            return "Search error"
        }
    }

    useEffect(() => {
        console.log(result)
    }, [result])

    return (
        <>
            <div className="results">
                <h2 className="title">
                    {searchState !== SearchState.NONE ? (
                        <>
                            {getSearchMessage(searchState, result)}
                            {searchState !== SearchState.ERROR ? <LoadingRing size="1.6rem" border="4px" /> : <></>}
                        </>
                    ) : result?.SOLUTION ? (
                        `Found ${result.SOLUTION.length} search results out of ${result.COUNT[0].attributes.TOTAL} candidates`
                    ) : <></>}
                </h2>
                {result?.SOLUTION ? <CodeResults results={result.SOLUTION} /> : <></>}
            </div>
            <style jsx>{`
                .title {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 1rem;
                    font-size: 1.5rem;
                    font-weight: normal;
                    margin-bottom: 30px;
                }
            `}</style>
        </>
    )
}

export default SearchResults
export { SearchState }