import LoadingRing from "../../components/loading-ring.jsx"

// Search state enum

const SearchState = {
    NONE: 0,
    VALIDATING: 1,
    SEARCHING: 2,
    ERROR: 3,
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

    return (
        <>
            <div className="results">
                <h2 className="title">
                    {searchState !== SearchState.NONE ? (
                        <>
                            {getSearchMessage(searchState, result)}
                            {searchState !== SearchState.ERROR ? <LoadingRing size="1.6rem" border="4px" /> : <></>}
                        </>
                    ) : result ? (
                        "Found " + result.length + " search results"
                    ) : <></>}
                </h2>
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
                }
            `}</style>
        </>
    )
}

export default SearchResults
export { SearchState }