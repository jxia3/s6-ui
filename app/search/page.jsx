'use client'

import MethodSearch from "./method.jsx"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

const SearchPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [ searchType ] = useState(getSearchType(searchParams.get("type")))

    return (
        <>
            <div className="search-type">Select search type</div>
            <div className="search-buttons">
                <button className="search-button" onClick={() => router.push("/search?type=method")}>
                    METHODS
                </button>
            </div>
            <MethodSearch />
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

function getSearchType(type) {
    if (type === "method") {
        return type
    }
    return "method"
}

export default SearchPage