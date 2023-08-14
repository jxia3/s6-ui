import { SearchState } from "../status.jsx"
import { Monospace } from "../../fonts.js"
import { useEffect, useState } from "react"

// Test case selection component

const TestCase = ({
    result,
    caseIndex,
    resultIndex,
    selections,
    setSelections
}) => {
    const selected = selections[caseIndex][resultIndex]

    // Changes selected status of test case

    function updateSelected(value) {
        const newSelections = [...selections]
        const newRow = [...newSelections[caseIndex]]
        newRow[resultIndex] = value
        newSelections[caseIndex] = newRow
        setSelections(newSelections)
    }

    return (
        <>
            <div className={`result ${selected ? "result-accepted" : ""}`}>
                <button
                    className={`button accept ${selected ? "accepted" : ""}`}
                    onClick={() => updateSelected(true)}
                >
                    ACCEPT
                </button>
                <button
                    className={`button reject ${!selected ? "rejected" : ""}`}
                    onClick={() => updateSelected(false)}
                >
                    REJECT
                </button>
                <div className={"value " + Monospace.className}>{result.VALUE.toString()}</div>
            </div>
            <style jsx>{`
                .result {
                    width: 100%;
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 0.5rem;
                    border: 2px solid #FFFFFF;
                    border-radius: 4px;
                    padding: 10px 20px;
                }

                .result-accepted {
                    border: 2px solid #83C983;
                }

                .button {
                    font-size: 0.8rem;
                    border: 2px solid #FFFFFF;
                    padding: 0.35rem 0.8rem;
                }

                .accept {
                    background-color: #D1EBD1;
                }

                .accept:hover {
                    background-color: #83C983;
                }

                .accepted {
                    border: 2px solid #83C983;
                }

                .reject {
                    background-color: #FFCACA;
                }

                .reject:hover {
                    background-color: #FF6767;
                }

                .rejected {
                    border: 2px solid #FF6767;
                }

                .value {
                    font-size: 0.8rem;
                    margin-left: 0.5rem;
                }
            `}</style>
        </>
    )
}

// Test case result selection component

const CaseSelect = ({
    testOptions,
    setTestOptions,
    method,
    tests,
    searchState,
    setSearchState,
    setResult
}) => {
    const [ testValues, setTestValues ] = useState([])
    const [ selections, setSelections ] = useState([])

    // Get test values from tests

    useEffect(() => {
        if (searchState !== SearchState.SEARCHING) return
        const newTestValues = []
        for (const test of tests) {
            if (test.comparator === "<??>") {
                newTestValues.push(method.NAME + "(" + test.left + ")")
            }
        }
        if (newTestValues.length) {
            setTestValues(newTestValues)
        }
    }, [searchState])

    // Create selections array

    useEffect(() => {
        if (testOptions?.TESTCASE) {
            const newSelections = []
            for (const testCase of testOptions.TESTCASE) {
                newSelections.push(testCase.USERCASE.map(() => false))
            }
            setSelections(newSelections)
        }
    }, [testOptions])

    // Continue search with selected cases

    async function continueSearch() {
        // Get selected IDs from test cases

        let selected = false
        const selectData = {}
        for (let t = 0; t < testOptions.TESTCASE.length; t ++) {
            const testCase = testOptions.TESTCASE[t]
            selectData[testCase.attributes.NAME] = {
                selected: [],
                rejected: [],
            }
            for (let r = 0; r < testCase.USERCASE.length; r ++) {
                if (selections[t][r]) {
                    selectData[testCase.attributes.NAME].selected.push(testCase.USERCASE[r].attributes.IDS)
                } else {
                    selectData[testCase.attributes.NAME].rejected.push(testCase.USERCASE[r].attributes.IDS)
                }
            }
            if (selectData[testCase.attributes.NAME].selected.length) {
                selected = true
            }
        }
        if (!selected) return

        setTestOptions(null)
        setSelections([])
        setSearchState(SearchState.SEARCHING)

        // Send selection request

        try {
            const selectResult = await fetch("/api/method/select-cases", {
                method: "POST",
                body: JSON.stringify({
                    userId: testOptions.attributes.UID,
                    testCases: selectData,
                }),
            }).then(response => response.json())

            if (selectResult?.error) {
                // Request error

                setSearchState(SearchState.ERROR)
                setResult({ error: selectResult.error })
                console.error(selectResult.error)
            } else if (selectResult?.result?.SOLUTIONS) {
                // Found search results

                setSearchState(SearchState.NONE)
                setResult({
                    SOLUTION: [],
                    ...selectResult.result.SOLUTIONS,
                })
            } else {
                console.error("Unable to interpret server response " + JSON.stringify(selectResult))
            }
        } catch(error) {
            setSearchState(SearchState.ERROR)
            console.error(error)
        }
    }

    // Count selected cases in selections

    function countAccepted(selections, caseIndex) {
        let accepted = 0
        for (const selection of selections[caseIndex]) {
            if (selection) {
                accepted ++
            }
        }
        return accepted
    }

    return testOptions?.TESTCASE && selections.length > 0 ? (
        <>
            <button className="continue" onClick={continueSearch}>CONTINUE WITH SELECTED</button>
            <div className="cases">
                {testOptions.TESTCASE.map((testCase, caseIndex) => (
                    <div className="case" key={testCase.attributes.NAME}>
                        <h3 className="title">
                            <div className="case-details">
                                Test case:
                                <span className={"case-params " + Monospace.className}>{testValues[caseIndex]}</span>
                            </div>
                            <div>
                                Cases accepted: {countAccepted(selections, caseIndex)}/{selections[caseIndex].length}
                            </div>
                        </h3>
                        {selections.length ? testCase.USERCASE.map((result, resultIndex) => (
                            <TestCase
                                result={result}
                                caseIndex={caseIndex}
                                resultIndex={resultIndex}
                                selections={selections}
                                setSelections={setSelections}
                                key={resultIndex}
                            />
                        )) : (<></>)}
                    </div>
                ))}
            </div>
            <style jsx>{`
                .continue {
                    font-size: 0.9rem;
                    padding: 0.5rem 1rem;
                    margin-bottom: 20px;
                }

                .cases {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: flex-start;
                }

                .case {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: flex-start;
                    gap: 10px;
                    border-top: 1px solid #888888;
                    padding: 20px 0 15px 0;
                }

                .case:last-of-type {
                    border-bottom: 1px solid #888888;
                }

                .title {
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: flex-start;
                    gap: 2px;
                    font-weight: normal;
                }

                .case-details {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                }

                .case-params {
                    margin-left: 6px;
                    font-size: 0.9rem;
                }
            `}</style>
        </>
    ) : (<></>)
}

export default CaseSelect