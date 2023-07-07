const LoadingRing = () => (
    <>
        <div className="ring"></div>
        <style jsx>{`
            .ring:after {
                content: " ";
                display: block;
                width: 1.6rem;
                height: 1.6rem;
                border: 4px solid #000000;
                border-radius: 50%;
                border-color: #000000 transparent transparent transparent;
                animation: spin 1.2s linear infinite;
            }

            @keyframes spin {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
        `}</style>
    </>
)

const SearchResults = ({ searchState, result }) => {
    function getSearchMessage(searchState) {
        if (searchState === "validating") {
            return "Validating tests"
        } else if (searchState === "searching") {
            return "Searching"
        } else if (searchState === "error") {
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
                    {searchState ? (
                        <>
                            {getSearchMessage(searchState, result)}
                            {searchState !== "error" ? <LoadingRing text={searchState} /> : <></>}
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