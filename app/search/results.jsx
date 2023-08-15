import beautify from "js-beautify/js"
import hljs from "highlight.js"
import { useEffect, useState } from "react"

// Ignore highlight.js XSS warning

hljs.configure({
    ignoreUnescapedHTML: true,
})

// Code results list component

const CodeResults = ({ results, sort, format }) => {
    const [ resultList, setResultList ] = useState([])

    // Run highlight.js on code blocks

    useEffect(() => {
        hljs.highlightAll()
    }, [resultList, format])

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

    // Format code and fix angle brackets

    function formatCode(code) {
        return beautify(code, {
            brace_style: "collapse,preserve-inline",
            e4x: true,
        })
            .replace(
                // Match type parameter lists
                /( [A-Za-z][\w$]*) < ([A-Za-z][\w$]*(?:, )*)* >/g,
                "$1<$2>"
            )
            .replaceAll("> ()", ">()")
            .replace(
                // Match for-each loops
                /(for \([A-Za-z][\w$<>, ]* )([A-Za-z][\w$]*)(?:: )/g,
                "$1$2 : "
            )
    }

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
                {resultList.map(result => {
                    const code = format ? formatCode(result.CODE) : result.CODE
                    return (
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
                                    {code}
                                </code>
                            </pre>
                            <div className="controls">
                                <button className="control" onClick={event => copyResult(event, code)}>COPY CODE</button>
                                <a className="control link-button" href={result.SOLSRC.slice(7)} target="_blank">VIEW RAW</a>
                                <a className="control link-button" href={"/api/license?id=" + result.LICENSE} target="_blank">VIEW LICENSE</a>
                            </div>
                        </div>
                    )
                })}
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

                .link-button {
                    background-color: var(--color);
                    border-radius: 4px;
                    transition-duration: 150ms;
                }

                .link-button:hover {
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
    const [ format, setFormat ] = useState(true)

    return result?.SOLUTION?.length ? (
        <>
            <div className="controls sort">
                Sort by
                <button
                    className={"control sort-type" + (sort === "size" ? " selected" : "")}
                    onClick={() => setSort("size")}
                >
                    CODE SIZE
                </button>
                <button
                    className={"control sort-type" + (sort === "complexity" ? " selected" : "")}
                    onClick={() => setSort("complexity")}
                >
                    COMPLEXITY
                </button>
                <button
                    className={"control sort-type" + (sort === "efficiency" ? " selected" : "")}
                    onClick={() => setSort("efficiency")}
                >
                    EFFICIENCY
                </button>
            </div>
            <div className="controls format">
                Code formatting
                <button className="control" onClick={() => setFormat(!format)}>
                    {format ? "ENABLED" : "DISABLED"}
                </button>
            </div>
            <CodeResults results={result.SOLUTION} sort={sort} format={format} />
            <style jsx>{`
                .controls {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 0.5rem;
                }

                .sort {
                    margin-top: 4px;
                    margin-bottom: 8px;
                }

                .control {
                    font-size: 0.8rem;
                    padding: 0.35rem 0.8rem;
                }

                .sort-type {
                    border: 2px solid #FFFFFF;
                }

                .selected {
                    border: 2px solid var(--color-dark);
                }

                .format {
                    margin-bottom: 20px;
                }
            `}</style>
        </>
    ) : (<></>)
}

export default SearchResults