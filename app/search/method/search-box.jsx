import { SearchState } from "../status.jsx"
import TextInput from "./input.jsx"
import Tests from "./tests.jsx"
import { useState } from "react"

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
    method,
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
                setDeclaration(check.RESULT.SIGNATURE.METHOD.TEXT.replaceAll(",", ", "))
            } else {
                console.error("Unable to interpret server response " + JSON.stringify(check))
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
                <Tests tests={tests} setTests={setTests} method={method} />
                <button
                    className={`search ${searchState !== SearchState.NONE && searchState !== SearchState.ERROR ? "search-disabled" : ""}`}
                    onClick={search}
                >SEARCH</button>
            </div>
            <style jsx>{`
                .card {
                    width: min(750px, 70%);
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

// Search options card

const SearchOptions = ({ setContextFile }) => {
    const [ enabled, setEnabled ] = useState(false)

    // Update selected file

    function setFile(event) {
        if (event.target.files[0]) {
            setContextFile(event.target.files[0])
        } else {
            setContextFile(null)
        }
    }

    // Clear selected file

    function clearFile() {
        document.getElementById("context-file").value = null
    }

    return enabled ? (
        <>
            <div className="card">
                <h2 className="title">Options</h2>
                <div className="label">Search context</div>
                <input
                    id="context-file"
                    className="file-input"
                    type="file"
                    onChange={setFile}
                ></input>
                <button className="clear" onClick={clearFile}>CLEAR</button>
                <div className="note">Note: this is a legacy feature and may not work as expected</div>
            </div>
            <style jsx>{`
                .card {
                    width: max(calc(100% - 780px), 30%);
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

                .label {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 0.6rem;
                    font-size: 0.9rem;
                    margin-bottom: 4px;
                }

                .file-input {
                    margin-bottom: 6px;
                }

                .clear {
                    font-size: 0.8rem;
                    background-color: var(--color-dark);
                    padding: 0.35rem 0.8rem;
                    margin-bottom: 20px;
                }

                .clear:hover {
                    background-color: var(--color-extra-dark);
                }

                .note {
                    font-size: 0.9rem;
                }
            `}</style>
        </>
    ) : (
        <>
            <button className="expand" onClick={() => setEnabled(true)}>+</button>
            <style jsx>{`
                .expand {
                    width: 3rem;
                    height: 3rem;
                    font-size: 1.5rem;
                    background-color: var(--fill);
                    border: 2px solid #E5E5E5;
                    border-radius: 4px;
                }
            `}</style>
        </>
    )
}

export { SearchBox, SearchOptions }