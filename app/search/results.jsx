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

const SearchResults = ({ searchState, results }) => (
    <>
        <div className="results">
            <h2 className="title">
                {searchState ? (
                    <>
                        {searchState.message}
                        {!searchState.error ? <LoadingRing text={searchState} /> : <></>}
                    </>
                ) : results ? (
                    results.length + " search results found"
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

export default SearchResults