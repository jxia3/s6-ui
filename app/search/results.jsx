import hljs from "highlight.js"
import { useEffect, useState } from "react"

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

const CodeResults = ({ results, sort }) => {
    console.log(results)
    const [ resultList, setResultList ] = useState([])

    // Run highlight.js on code blocks

    useEffect(() => {
        hljs.highlightAll()
    }, [resultList])

    // Change results sort

    useEffect(() => {
        if (sort === "size") {
            setResultList([...results].sort((a, b) => +a.COMPLEXITY.attributes.LINES - +b.COMPLEXITY.attributes.LINES))
        } else if (sort === "complexity") {
            setResultList([...results].sort((a, b) => +a.COMPLEXITY.attributes.CODE - +b.COMPLEXITY.attributes.CODE))
        } else {
            setResultList([...results].sort((a, b) => +a.COMPLEXITY.attributes.TESTTIME - +b.COMPLEXITY.attributes.TESTTIME))
        }
    }, [results, sort])

    // Copy code to clipboard

    async function copyResult(event, code) {
        try {
            await navigator.clipboard.writeText(code)
            event.target.classList.add("flash")
            setTimeout(() => {
                event.target.classList.remove("flash")
            }, 300)
        } catch(error) {
            console.error(error)
        }
    }

    return (
        <>
            <div className="results">
                {resultList.map(result => (
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
                        <div className="controls">
                            <button className="control" onClick={event => copyResult(event, result.CODE)}>COPY CODE</button>
                            <a className="control view-raw" href={result.SOLSRC.slice(7)} target="_blank">VIEW RAW</a>
                            <button className="control">VIEW LICENSE</button>
                        </div>
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

                .controls {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 0.5rem;
                }

                .control {
                    font-size: 0.8rem;
                    padding: 0.4rem 0.8rem;
                }

                .view-raw {
                    background-color: var(--color);
                    border-radius: 4px;
                    transition-duration: 150ms;
                }

                .view-raw:hover {
                    background-color: var(--color-dark);
                }

                .flash {
                    animation: flash 300ms;
                }

                @keyframes flash {
                    50% {
                        background-color: var(--color-extra-dark);
                    }

                    100% {
                        background-color: var(--color-dark);
                    }
                }
            `}</style>
        </>
    )
}

// Search result list

const SearchResults = ({ result }) => {
    const [ sort, setSort ] = useState("size")

    return result?.SOLUTION ? (
        <>
            <div className="sort">
                Sort by
                <button
                    className={"sort-type" + (sort === "size" ? " selected" : "")}
                    onClick={() => setSort("size")}
                >
                    CODE SIZE
                </button>
                <button
                    className={"sort-type" + (sort === "complexity" ? " selected" : "")}
                    onClick={() => setSort("complexity")}
                >
                    COMPLEXITY
                </button>
                <button
                    className={"sort-type" + (sort === "efficiency" ? " selected" : "")}
                    onClick={() => setSort("efficiency")}
                >
                    EFFICIENCY
                </button>
            </div>
            <CodeResults results={result.SOLUTION} sort={sort} />
            <style jsx>{`
                .sort {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 20px;
                }

                .sort-type {
                    font-size: 0.8rem;
                    padding: 0.35rem 0.8rem;
                    border: 2px solid #FFFFFF;
                }

                .selected {
                    border: 2px solid var(--color-dark);
                }
            `}</style>
        </>
    ) : (<></>)
}

export default SearchResults