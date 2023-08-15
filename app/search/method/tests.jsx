import { Monospace } from "../../fonts.js"
import React, { useEffect, useRef, useState } from "react"

// Formatted test parameters with function name input

const ParamInput = ({ test, index, method, updateTest, updateTests }) => {
    const [ inputText, setInputText ] = useState("")
    const formatted = useRef(false)
    const textBefore = useRef("")
    const checkCursor = useRef(null)

    // Add method name to function parameters

    useEffect(() => {
        if (test.left) {
            checkCursor.current = true
        }
        updateInputText(test.left)
    }, [method])

    // Check cursor position on important state change

    useEffect(() => {
        if (checkCursor.current) {
            checkCursor.current = false
            if (document.activeElement?.classList?.contains("test-input") && method?.NAME) {
                setCursorPosition(document.activeElement)
            }
        }
    }, [inputText])

    // Check for valid update to text input

    function checkUpdateEvent(event) {
        const value = event.target.value
        if (!value) {
            // Everything in input deleted

            formatted.current = false
            textBefore.current = ""
            setInputText("")
            updateTest(index, "left", "")
            return
        } else if (formatted.current
            && /^[A-Za-z][\w$]*\(\)$/g.test(textBefore.current)
            && value.length < textBefore.current.length) {
            // Delete on empty formatted method

            formatted.current = false
            textBefore.current = ""
            setInputText("")
            updateTest(index, "left", "")
            return
        } else if (formatted.current && method?.NAME && textBefore.current) {
            const formatBegin = method.NAME + "("
            if (!value.startsWith(formatBegin) && value.endsWith(")")) {
                if (!/^[A-Za-z][\w$]*\(.*\)$/g.test(value)) {
                    if (value.startsWith(method.NAME) && value.length === textBefore.current.length - 1) {
                        // Set cursor position 1 after begin parentheses

                        setTimeout(() => {
                            event.target.setSelectionRange(formatBegin.length, formatBegin.length)
                        })
                    } else {
                        // Delete from beginning section of parameters and reformat

                        let matchLength = 0
                        for (let c = 0; c < method.NAME.length; c ++) {
                            if (value[c] == textBefore.current[c]) {
                                matchLength ++
                            } else {
                                break
                            }
                        }

                        const params = value.slice(matchLength, -1)
                        const formatText = formatBegin + params + ")"

                        checkCursor.current = true
                        textBefore.current = formatText
                        setInputText(formatText)
                        updateTest(index, "left", params)
                    }
                }
                return
            } else if (value.startsWith(formatBegin) && !value.endsWith(")")) {
                if (value.length < textBefore.current.length) {
                    // Delete from end section of parameters and reformat
                    
                    const params = value.slice(formatBegin.length)
                    const formatText = formatBegin + params + ")"

                    if (formatText !== textBefore.current) {
                        checkCursor.current = true
                        textBefore.current = formatText
                        setInputText(formatText)
                        updateTest(index, "left", params)
                    } else {
                        // Set cursor position 1 before end parentheses

                        setTimeout(() => {
                            event.target.setSelectionRange(formatText.length - 1, formatText.length - 1)
                        })
                    }

                    return
                } else if (value.length > textBefore.current.length
                    && textBefore.current.lastIndexOf(")") === value.lastIndexOf(")")) {
                    // Add to end section of parameters and reformat

                    const params = value.slice(formatBegin.length, value.lastIndexOf(")"))
                    const extraParams = value.slice(value.lastIndexOf(")") + 1)
                    const formatText = formatBegin + params + extraParams + ")"

                    checkCursor.current = true
                    textBefore.current = formatText
                    setInputText(formatText)
                    updateTest(index, "left", params + extraParams)

                    return
                }
            } else if (!value.startsWith(formatBegin) && !value.endsWith(")")) {
                // Entire parameter list deleted

                formatted.current = false
                textBefore.current = ""
                setInputText("")
                updateTest(index, "left", "")
                return
            }
        }

        // Default update

        updateInputText(value)
    }

    // Update text input value and store text value as previous

    function updateInputText(value) {
        if (!value) {
            formatted.current = false
            textBefore.current = ""
            return
        }

        if (method?.NAME) {
            formatted.current = true
            if (/^[A-Za-z][\w$]*\(.*\)$/g.test(value)) {
                // Detected function with parentheses

                const params = value.slice(value.indexOf("(") + 1, -1)
                const text = method.NAME + "(" + params + ")"
                textBefore.current = text
                setInputText(text)
                updateTest(index, "left", params)
            } else {
                // Consider entire value as parameters

                const text = method.NAME + "(" + value + ")"
                checkCursor.current = true
                textBefore.current = text
                setInputText(text)
                updateTest(index, "left", value)
            }
        } else {
            if (!formatted.current) {
                // No method name and not formatted

                textBefore.current = value
                setInputText(value)
                updateTest(index, "left", value)
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