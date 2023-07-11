'use client'

import MethodSearch from "./method/search.jsx"
import SearchResults, { SearchState } from "./results.jsx"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

// Search page content layout

const SearchPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [ searchType ] = useState(getSearchType(searchParams.get("type")))
    const [ searchState, setSearchState ] = useState(SearchState.NONE)
    const [ result, setResult ] = useState(null)

    return (
        <>
            <div className="search-type">Select search type</div>
            <div className="search-buttons">
                <button className="search-button" onClick={() => router.push("/search?type=method")}>
                    METHODS
                </button>
            </div>
            <MethodSearch setSearchState={setSearchState} setResult={setResult} />
            <SearchResults searchState={searchState} result={result} />
            <style jsx>{`
                .search-type {
                    font-size: 1.2rem;
                    margin-bottom: 10px;
                }

                .search-buttons {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 30px;
                }

                .search-button {
                    font-size: 1.2rem;
                    padding: 0.6rem 1.2rem;
                }
            `}</style>
        </>
    )
}

// Check search type or return default

function getSearchType(type) {
    if (type === "method") {
        return type
    }
    return "method"
}

export default SearchPage