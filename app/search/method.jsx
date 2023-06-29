import { Monospace } from "../fonts.js"
import { useEffect, useState } from "react"

const TextInput = ({ label, value, setValue, error, setError, onChange, onBlur, monospace }) => (
    <>
        <div className="content">
            <div className="label">{label}</div>
            <input
                className={monospace ? `input ${Monospace.className}` : "input"}
                type="text"
                value={value}
                onChange={event => {
                    if (onChange) {
                        onChange()
                    }
                    setValue(event.target.value)
                }}
                onFocus={setError ? () => setError(null) : null}
                onBlur={onBlur}
            ></input>
            {error ? <div className={`error ${Monospace.className}`}>Error: {error}</div> : <></>}
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

const Tests = ({ tests, setTests }) => {
    function updateTest(index, prop, value) {
        setTests(tests.toSpliced(index, 1, {
            ...tests[index],
            [prop]: value,
        }))
    }

    function updateTests() {
        if (tests.length === 1 && (tests[0].left || tests[0].right)) {
            setTests([
                tests[0],
                {
                    left: "",
                    comparator: "==",
                    right: "",
                    error: null,
                }
            ])
            return
        }

        const newTests = [...tests.slice(0, -1).filter(test => test.left || test.right)]
        newTests.push(tests[tests.length - 1])
        if (newTests[newTests.length - 1].left || newTests[newTests.length - 1].right) {
            newTests.push({
                left: "",
                comparator: "==",
                right: "",
                error: null,
            })
        }
        if (newTests.length === tests.length) return
        setTests(newTests)
    }

    return (
        <>
            <div className="content">
                <div className="label">Method tests</div>
                {tests.map((test, index) => (
                    <>
                        <div className="test" key={"test-" + index}>
                            <input
                                className={"input " + Monospace.className}
                                type="text"
                                value={test.left}
                                onChange={event => updateTest(index, "left", event.target.value)}
                                onFocus={() => updateTest(index, "error", null)}
                                onBlur={() => updateTests()}
                                style={{ border: test.error ? "2px solid var(--error)" : "" }}
                            ></input>
                            <select
                                className={"comparator " + Monospace.className}
                                value={test.comparator}
                                onChange={event => updateTest(index, "comparator", event.target.value)}
                                onFocus={() => updateTest(index, "error", null)}
                                style={{ border: test.error ? "2px solid var(--error)" : "" }}
                            >
                                <option value="==">==</option>
                                <option value="!=">!=</option>
                                <option value="throws">throws</option>
                                <option value="===">===</option>
                                <option value="!==">!==</option>
                                {/*<option value="<??>">{"<??>"}</option>*/}
                            </select>
                            <input
                                className={"input " + Monospace.className}
                                type="text"
                                value={test.right}
                                onChange={event => updateTest(index, "right", event.target.value)}
                                onFocus={() => updateTest(index, "error", null)}
                                onBlur={() => updateTests()}
                                style={{ border: test.error ? "2px solid var(--error)" : "" }}
                            ></input>
                        </div>
                        {test.error ? <div className={`error ${Monospace.className}`} key={"error-" + index}>Error: {test.error}</div> : <></>}
                    </>
                ))}
            </div>
            <style jsx>{`
                .content {
                    margin-bottom: 20px;
                }

                .label {
                    font-size: 0.9rem;
                    margin-bottom: 4px;
                }

                .test {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .input {
                    width: 100%;
                    padding: 2px 5px;
                }

                .comparator {
                    padding: 2px 5px;
                    margin: 0 0.3rem;
                }

                .error {
                    font-size: 0.8rem;
                    color: var(--error);
                    margin-bottom: 6px;
                }
            `}</style>
        </>
    )
}

const MethodSearch = () => {
    const [ description, setDescription ] = useState("")
    const [ descriptionError, setDescriptionError ] = useState(null)
    const [ declaration, setDeclaration ] = useState("")
    const [ declarationError, setDeclarationError ] = useState(null)
    const [ method, setMethod ] = useState(null)
    const [ tests, setTests ] = useState([{
        left: "",
        comparator: "==",
        right: "",
        error: null,
    }])

    async function checkSignature() {
        try {
            const check = await fetch("/api/method/signature", {
                method: "POST",
                body: JSON.stringify({
                    signature: declaration,
                }),
            }).then(response => response.json())
            
            if (check?.RESULT?.SIGNATURE?.METHOD) {
                setMethod(check.RESULT.SIGNATURE.METHOD)
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
        let error = declarationError ? true : false
        if (!description) {
            setDescriptionError("Missing description")
            error = true
        }

        if (!declaration) {
            setDeclarationError("Missing method declaration")
            error = true
        } else if (!declarationError && !method) {
            setDeclarationError("Missing method data")
            error = true
        }

        if (tests.length === 1 && (!tests[0].left || !tests[0].right)) {
            setTests([{
                ...tests[0],
                error: "No tests set",
            }])
            error = true
        } else {
            let testError = false
            const newTests = []
            for (const test of tests.slice(0, -1)) {
                if (!test.left || !test.right) {
                    newTests.push({
                        ...test,
                        error: "Test not complete",
                    })
                    error = true
                    testError = true
                } else {
                    if (test.error) {
                        error = true
                    }
                    newTests.push(test)
                }
            }

            if (tests.length > 1) {
                newTests.push(tests[tests.length - 1])
            }
            if (testError) {
                setTests(newTests)
            }
        }

        if (error) return
        try {
            const check = await fetch("/api/method/tests", {
                method: "POST",
                body: JSON.stringify({
                    method,
                    tests: tests.slice(0, -1).map(test => ({
                        left: test.left,
                        comparator: test.comparator,
                        right: test.right,
                    })),
                }),
            }).then(response => response.json())
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