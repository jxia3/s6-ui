import { SearchState } from "../status.jsx"
import TextInput from "./input.jsx"
import Tests from "./tests.jsx"

// Search details card

const SearchBox = ({
    searchState,
    description,
    setDescription,
    descriptionError,
    setDescriptionError,
    declaration,
    setDeclaration,
    declarationError,
    setDeclarationError,
    setMethod,
    tests,
    setTests,
    search,
}) => {
    // Get function signature data from server on blur

    async function checkSignature() {
        try {
            const check = await fetch("/api/method/signature", {
                method: "POST",
                body: JSON.stringify({
                    signature: declaration,
                }),
            }).then(response => response.json())
            
            if (check?.error || check?.PROBLEM) {
                setDeclarationError(check?.error || check?.PROBLEM)
            } else if (check?.RESULT?.SIGNATURE?.METHOD) {
                setMethod(check.RESULT.SIGNATURE.METHOD)
                setDeclaration(check.RESULT.SIGNATURE.METHOD.TEXT)
            } else {
                console.error(new Error("Unable to interpret server response " + JSON.stringify(check)))
            }
        } catch(error) {
            console.error(error)
        }
    }

    return (
        <>
            <div className="card">
                <h2 className="title">Method Search</h2>
                <TextInput
                    label="Description (keywords)"
                    value={description}
                    setValue={setDescription}
                    error={descriptionError}
                    setError={setDescriptionError}
                />
                <TextInput
                    label="Declaration (signature)"
                    value={declaration}
                    setValue={setDeclaration}
                    error={declarationError}
                    setError={setDeclarationError}
                    onChange={() => setMethod(null)}
                    onBlur={checkSignature}
                    monospace
                />
                <Tests tests={tests} setTests={setTests} />
                <button
                    className={`search ${searchState !== SearchState.NONE ? "search-disabled" : ""}`}
                    onClick={search}
                >SEARCH</button>
            </div>
            <style jsx>{`
                .card {
                    width: min(750px, 100%);
                    background-color: var(--fill);
                    border-radius: 4px;
                    padding: 30px 40px;
                    margin-bottom: 30px;
                }

                .title {
                    font-size: 1.5rem;
                    font-weight: normal;
                    margin-bottom: 20px;
                }

                .search {
                    font-size: 1.2rem;
                    background-color: var(--color-dark);
                    padding: 0.6rem 1.2rem;
                    margin-top: 5px;
                }

                .search:hover {
                    background-color: var(--color-extra-dark);
                }

                .search-disabled {
                    cursor: auto;
                    background-color: var(--color) !important;
                }
            `}</style>
        </>
    )
}

export { SearchBox }