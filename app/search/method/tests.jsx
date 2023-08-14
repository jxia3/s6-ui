import { Monospace } from "../../fonts.js"
import React from "react"

// Function test case input

const Tests = ({ tests, setTests }) => {
    // Update test data on input

    function updateTest(index, prop, value) {
        setTests(tests.toSpliced(index, 1, {
            ...tests[index],
            [prop]: value,
            ...(prop === "comparator" && value === "<??>" ? { right: "" } : null),
        }))
    }

    // Add or remove test cases on input

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
                    <React.Fragment key={index}>
                        <div className="test">
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
                                <option value="<??>">{"<??>"}</option>
                            </select>
                            <input
                                className={"input " + Monospace.className}
                                type="text"
                                value={test.right}
                                disabled={test.comparator === "<??>"}
                                onChange={event => updateTest(index, "right", event.target.value)}
                                onFocus={() => updateTest(index, "error", null)}
                                onBlur={() => updateTests()}
                                style={{ border: test.comparator !== "<??>" && test.error ? "2px solid var(--error)" : "" }}
                            ></input>
                        </div>
                        {test.error ? <div className={"error " + Monospace.className}>Error: {test.error}</div> : <></>}
                    </React.Fragment>
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
                    font-size: 0.8rem;
                    padding: 2px 5px;
                }

                .comparator {
                    font-size: 0.8rem;
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

export default Tests