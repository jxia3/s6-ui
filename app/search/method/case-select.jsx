import { SearchState } from "../status.jsx"
import { Monospace } from "../../fonts.js"
import { useEffect, useState } from "react"

// Test case result selection component

const CaseSelect = ({
    testOptions,
    tests,
    searchState,
    setSearchState,
    setResult
}) => {
    const [ testValues, setTestValues ] = useState([])

    useEffect(() => {
        if (searchState !== SearchState.SEARCHING) return
        const newTestValues = []
        for (const test of tests) {
            if (test.comparator === "<??>") {
                newTestValues.push(test.left)
            }
        }
        if (newTestValues.length) {
            setTestValues(newTestValues)
        }
    }, [searchState])

    return testOptions?.TESTCASE ? (
        <>
            <div className="cases">
                {testOptions.TESTCASE.map((testCase, index) => (
                    <div className="case" key={testCase.attributes.NAME}>
                        <h3 className="title">
                            Test case:&nbsp;
                            <span className={Monospace.className}>{testValues[index]}</span>
                        </h3>
                    </div>
                ))}
            </div>
            <style jsx>{`
                .cases {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: flex-start;
                    margin-top: 10px;
                }

                .case {
                    width: 100%;
                    border-top: 1px solid #888888;
                    padding: 20px 0;
                }

                .case:last-of-type {
                    border-bottom: 1px solid #888888;
                }

                .title {
                    font-weight: normal;
                }
            `}</style>
        </>
    ) : (<></>)
}

export default CaseSelect