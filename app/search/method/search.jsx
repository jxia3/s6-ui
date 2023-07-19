import { SearchBox } from "./search-box.jsx"
import SearchStatus, { SearchState } from "../status.jsx"
import CaseSelect from "./case-select.jsx"
import SearchResults from "../results.jsx"
import { useState } from "react"

// Method search layout

const MethodSearch = () => {
    const [ searchState, setSearchState ] = useState(SearchState.NONE)
    const [ testOptions, setTestOptions ] = useState(null)
    const [ result, setResult ] = useState(null)

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

    // Search for method

    async function search() {
        // Validate search details

        setTestOptions(null)
        setResult(null)
        setSearchState(SearchState.VALIDATING)

        const error = validateSearch()
        if (error) {
            setSearchState(SearchState.NONE)
            return
        }
        const testData = await validateTests()
        if (testData.error) {
            setSearchState(SearchState.NONE)
            return
        }

        setSearchState(SearchState.SEARCHING)

        // Send search request

        try {
            const searchResult = await fetch("/api/method/search", {
                method: "POST",
                body: JSON.stringify({
                    method,
                    tests: testData.data,
                    description,
                }),
            }).then(response => response.json())
        
            if (searchResult?.error) {
                // Request error

                setSearchState(SearchState.ERROR)
                setResult({ error: searchResult.error })
            } else if (searchResult?.result?.SOLUTIONS) {
                // Found search results

                setSearchState(SearchState.NONE)
                setResult({
                    SOLUTION: [],
                    ...searchResult.result.SOLUTIONS,
                })
            } else if (searchResult?.result?.USERINPUT) {
                // Parse test case selection response

                console.log("search result", searchResult)
                setSearchState(SearchState.NONE)
                if (!Array.isArray(searchResult.result.USERINPUT.TESTCASE)) {
                    searchResult.result.USERINPUT.TESTCASE = [searchResult.result.USERINPUT.TESTCASE]
                }
                setTestOptions({
                    ...searchResult.result.USERINPUT,
                    cases: searchResult.result.USERINPUT.TESTCASE.reduce(
                        (count, testCase) => count + testCase.USERCASE.length,
                        0
                    ),
                })
            } else {
                console.error(new Error("Unable to interpret server response " + JSON.stringify(searchResult)))
            }
        } catch(error) {
            setSearchState(SearchState.ERROR)
            console.error(error)
        }
    }

    // Check method description, signature, and tests

    function validateSearch() {
        // Check required fields

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

        // Check test cases for completeness

        if (tests.length === 1) {
            setTests([{
                ...tests[0],
                error: "No tests set",
            }])
            error = true
        } else {
            let testError = false
            const newTests = []
            for (const test of tests.slice(0, -1)) {
                if (!test.left || (test.comparator !== "<??>" && !test.right)) {
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

        return error
    }

    // Check tests and get test data from server

    async function validateTests() {
        try {
            // Send validation request

            const testResult = await fetch("/api/method/tests", {
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

            if (testResult?.error) {
                console.error(new Error(testResult.error))
                return { error: true }
            }
            const testCases = !Array.isArray(testResult) ? [testResult] : testResult

            // Update test cases with changed values and possible errors

            let error = false
            let updated = false
            const newTests = []
            for (let t = 0; t < testCases.length; t ++) {
                const newTest = { ...tests[t] }
                if (testCases[t].ERROR) {
                    newTest.error = testCases[t].ERROR.attributes.MESSAGE
                    error = true
                    newTests.push(newTest)
                    continue
                }
                if (testCases[t].CALL?.INPUT?.VALUE && testCases[t].CALL.INPUT.VALUE !== newTest.left) {
                    newTest.left = testCases[t].CALL.INPUT.VALUE
                    updated = true
                }
                if (newTest.comparator !== "<??>"
                    && testCases[t].CALL?.OUTPUT?.VALUE
                    && testCases[t].CALL.OUTPUT.VALUE !== newTest.right) {
                    newTest.right = testCases[t].CALL.OUTPUT.VALUE
                    updated = true
                }
                newTests.push(newTest)
            }
            newTests.push({
                left: "",
                comparator: "==",
                right: "",
                error: null,
            })

            if (error) {
                setTests(newTests)
                return { error: true }
            }
            if (updated) {
                setTests(newTests)
            }
            return { data: testCases }
        } catch(error) {
            console.error(error)
            return { error: true }
        }
    }

    return (
        <>
            <SearchBox
                description={description}
                setDescription={setDescription}
                descriptionError={descriptionError}
                setDescriptionError={setDescriptionError}
                declaration={declaration}
                setDeclaration={setDeclaration}
                declarationError={declarationError}
                setDeclarationError={setDeclarationError}
                setMethod={setMethod}
                tests={tests}
                setTests={setTests}
                search={search}
            />
            <SearchStatus
                searchState={searchState}
                testOptions={testOptions}
                result={result}
            />
            {searchState === SearchState.NONE ? (
                <>
                    <CaseSelect
                        testOptions={testOptions}
                        setSearchState={setSearchState}
                        setResult={setResult}
                    />
                    <SearchResults result={result} />
                </>
            ) : (<></>)}
        </>
    )
}

export default MethodSearch