import { Monospace } from "../../fonts.js"
import React, { useEffect, useRef, useState } from "react"

// Formatted test parameters with function name input

const ParamInput = ({ test, index, method, updateTest, updateTests }) => {
    const [ inputText, setInputText ] = useState("")
    const formatted = useRef(false)
    const textBefore = useRef("")
    const methodChanged = useRef(null)

    // Add method name to function parameters

    useEffect(() => {
        methodChanged.current = true
        updateInputText(test.left)
    }, [method])

    // Check cursor position on method change

    useEffect(() => {
        if (methodChanged.current) {
            methodChanged.current = false
            if (document.activeElement?.classList?.contains("test-input") && method?.NAME) {
                setCursorPosition(document.activeElement)
            }
        }
    }, [inputText])

    // Check for valid update to text input

    function checkUpdateEvent(event) {
        console.log("before", textBefore.current, "after", event.target.value)
        if (!event.target.value) {
            setInputText("")
            updateTest(index, "left", "")
        } else {
            updateInputText(event.target.value)
        }
    }

    // Update text input value and store text value as previous

    function updateInputText(value) {
        if (!value) {
            formatted.current = false
            textBefore.current = ""
            return
        }

        if (method?.NAME) {
            if (/^[A-Za-z][\w$]*\(.*\)$/g.test(value)) {
                // Detected function with parentheses

                const params = value.slice(value.indexOf("(") + 1, -1)
                const text = method.NAME + "(" + params + ")"
                setInputText(text)
                updateTest(index, "left", params)
                textBefore.current = text
            } else {
                // Consider entire value as parameters

                const text = method.NAME + "(" + value + ")"
                setInputText(text)
                updateTest(index, "left", value)
                textBefore.current = text
            }
            formatted.current = true
        } else {
            if (!formatted.current) {
                // No method name and not formatted

                setInputText(value)
                updateTest(index, "left", value)
                textBefore.current = value
            }
            formatted.current = false
        }
    }

    // Set cursor position to inside function parameters

    function setCursorPosition(input) {
        if (!input.value) return
        if (method?.NAME) {
            if (input.selectionStart === input.selectionEnd) {
                if (input.selectionEnd === input.value.length) {
                    input.setSelectionRange(input.value.length - 1, input.value.length - 1)
                } else if (input.selectionStart < method.NAME.length + 1) {
                    input.setSelectionRange(method.NAME.length + 1, method.NAME.length + 1)
                }
            }
        }
    }

    return (
        <>
            <input
                className={"test-input " + Monospace.className}
                type="text"
                value={inputText}
                onChange={checkUpdateEvent}
                onFocus={() => updateTest(index, "error", null)}
                onClick={event => setCursorPosition(event.target)}
                onBlur={() => updateTests()}
                style={{ border: test.error ? "2px solid var(--error)" : "" }}
            ></input>
            <style jsx>{`
                .test-input {
                    width: 100%;
                    font-size: 0.8rem;
                    padding: 2px 5px;
                }
            `}</style>
        </>
    )
}

// Function test case input

const Tests = ({ tests, setTests, method }) => {
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
                {JSON.stringify(tests)}
                {tests.map((test, index) => (
                    <React.Fragment key={index}>
                        <div className="test">
                            <ParamInput
                                test={test}
                                index={index}
                                method={method}
                                updateTest={updateTest}
                                updateTests={updateTests}
                            ></ParamInput>
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