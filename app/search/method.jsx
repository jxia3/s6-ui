import { Monospace } from "../fonts.js"
import { useState } from "react"

const TextInput = ({ label, value, setValue, error, setError, onBlur, monospace }) => (
    <>
        <div className="content">
            <div className="label">{label}</div>
            <input
                className={monospace ? `input ${Monospace.className}` : "input"}
                type="text"
                value={value}
                onChange={event => setValue(event.target.value)}
                onFocus={setError ? () => setError(null) : null}
                onBlur={onBlur}
            ></input>
            {error ? <div className={`${Monospace.className} error`}>Error: {error}</div> : <></>}
        </div>
        <style jsx>{`
            .content {
                margin-bottom: 20px;
            }

            .label {
                font-size: 0.9rem;
                margin-bottom: 4px;
            }

            .input {
                width: 100%;
                padding: 2px 5px;
            }

            .input {
                ${error ? "border: 2px solid var(--error)" : ""};
            }

            .error {
                font-size: 0.8rem;
                color: var(--error);
                margin-top: 4px;
            }
        `}</style>
    </>
)

const MethodSearch = () => {
    const [ description, setDescription ] = useState("")
    const [ descriptionError, setDescriptionError ] = useState(null)
    const [ declaration, setDeclaration ] = useState("")
    const [ declarationError, setDeclarationError ] = useState(null)

    async function checkSignature() {
        try {
            const check = await fetch("/api/method/signature", {
                method: "POST",
                body: JSON.stringify({
                    signature: declaration
                })
            }).then(response => response.json())
            
            if (check?.RESULT?.SIGNATURE?.METHOD) {
                setDeclaration(check.RESULT.SIGNATURE.METHOD.TEXT)
            } else if (check?.PROBLEM) {
                setDeclarationError(check.PROBLEM)
            } else {
                console.error(new Error("Unable to interpret server response " + JSON.stringify(check)))
            }
        } catch(error) {
            console.error(error)
        }
    }

    async function search() {
        if (!description) {
            setDescriptionError("Missing description")
            return
        } else if (declarationError) {
            return
        }

        try {
            console.log("searching")
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
                    onBlur={checkSignature}
                    monospace
                />
                <button className="search" onClick={search}>SEARCH</button>
            </div>
            <style jsx>{`
                .card {
                    width: min(800px, 100%);
                    background-color: #F5F5F5;
                    border-radius: 4px;
                    padding: 30px 50px;
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
            `}</style>
        </>
    )
}

export default MethodSearch