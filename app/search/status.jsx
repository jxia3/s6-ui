import LoadingRing from "../../components/loading-ring.jsx"

// Search state enum

const SearchState = {
    NONE: 0,
    VALIDATING: 1,
    SEARCHING: 2,
    ERROR: 3,
}

// Search status component

const SearchStatus = ({ searchState, testOptions, result }) => {
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
            <h2 className="status">
                {searchState !== SearchState.NONE ? (
                    <>
                        {getSearchMessage(searchState, result)}
                        {searchState !== SearchState.ERROR ? <LoadingRing size="1.6rem" border="4px" /> : <></>}
                    </>
                ) : result?.SOLUTION ? (
                    `Found ${result.SOLUTION.length} search results out of ${result.COUNT[0].attributes.TOTAL} candidate`
                        + (result.COUNT[0].attributes.TOTAL !== 1 ? "s" : "")
                ) : testOptions?.cases ? (
                    `Found ${testOptions.cases} test case option${testOptions.cases !== 1 ? "s" : ""}`
                ) : <></>}
            </h2>
            <style jsx>{`
                .status {
                    display: inline-flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 1rem;
                    font-size: 1.5rem;
                    font-weight: normal;
                    margin-bottom: 10px;
                }
            `}</style>
        </>
    )
}

export default SearchStatus
export { SearchState }