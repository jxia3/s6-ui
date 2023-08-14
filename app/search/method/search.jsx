import { SearchBox, SearchOptions } from "./search-box.jsx"
import SearchStatus, { SearchState } from "../status.jsx"
import CaseSelect from "./case-select.jsx"
import SearchResults from "../results.jsx"
import { useEffect, useState } from "react"

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
    const [ contextFile, setContextFile ] = useState(null)
    const [ contextData, setContextData ] = useState(null)

    // Reset context data on file change

    useEffect(() => {
        setContextData(null)
    }, [contextFile])

    // Search for method

    async function search() {
        // Validate search parameters

        if (searchState !== SearchState.NONE && searchState !== SearchState.ERROR) {
            return
        }
        setTestOptions(null)
        setResult(null)
        setSearchState(SearchState.VALIDATING)

        const error = validateSearch()
        if (error) {
            setSearchState(SearchState.NONE)
            return
        }

        // Upload context file

        let context = contextData
        if (contextFile && !context) {
            setSearchState(SearchState.UPLOADING)
            try {
                const result = await uploadContext()
                if (result.error) {
                    return
                }
                context = result.data
            } catch(error) {
                setSearchState(SearchState.ERROR)
                console.error(error)
                return
            }
        }

        // Validate tests

        let testData
        try {
            const result = await validateTests(context)
            if (result.error) {
                setSearchState(SearchState.NONE)
                return
            }
            testData = result.data
        } catch(error) {
            setSearchState(SearchState.ERROR)
            console.error(error)
            return
        }

        // Send search request

        setSearchState(SearchState.SEARCHING)
        try {
            await sendSearchRequest(testData, context)
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

    // Read context file and upload to server

    async function uploadContext() {
        const uploadResult = await fetch("/api/method/upload-context", {
            method: "POST",
            body: contextFile,
        }).then(response => response.json())

        if (uploadResult?.error) {
            // Request error

            setSearchState(SearchState.ERROR)
            setResult({ error: uploadResult.error })
            console.error(uploadResult.error)
            return { error: true }
        } else if (uploadResult?.fileName) {
            // File uploaded

            const context = {
                fileName: uploadResult.fileName,
                time: Date.now(),
            }
            setContextData(context)
            return { data: context }
        } else {
            console.error("Unable to interpret server response " + JSON.stringify(searchResult))
            return { error: true }
        }
    }

    // Check tests and get test data from server

    async function validateTests(context) {
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
                    ...(context ? { contextFile: context.fileName } : null),
                }),
            }).then(response => response.json())

            if (testResult?.error) {
                console.error(testResult.error)
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

                const leftValue = formatValue(testCases[t].CALL?.INPUT)
                if (leftValue !== newTest.left) {
                    newTest.left = leftValue
                    updated = true
                }
                if (newTest.comparator !== "<??>") {
                    const rightValue = formatValue(testCases[t].CALL?.OUTPUT)
                    if (rightValue !== newTest.right) {
                        newTest.right = rightValue
                        updated = true
                    }
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

    // Format value from test validation request

    function formatValue(values) {
        if (!values) return
        if (Array.isArray(values)) {
            return values.map(value => value.VALUE).join(", ")
        }
        return values.VALUE.toString()
    }

    // Send search request

    async function sendSearchRequest(testData, context) {
        const searchResult = await fetch("/api/method/search", {
            method: "POST",
            body: JSON.stringify({
                method,
                tests: testData,
                description,
                ...(context ? { contextFile: context.fileName } : null),
            }),
        }).then(response => response.json())
    
        if (searchResult?.error) {
            // Request error

            setSearchState(SearchState.ERROR)
            setResult({ error: searchResult.error })
            console.error(searchResult.error)
        } else if (searchResult?.result?.SOLUTIONS) {
            // Found search results

            setSearchState(SearchState.NONE)
            setResult({
                SOLUTION: [],
                ...searchResult.result.SOLUTIONS,
            })
        } else if (searchResult?.result?.USERINPUT) {
            // Parse test case selection response

            setSearchState(SearchState.NONE)
            if (!Array.isArray(searchResult.result.USERINPUT.TESTCASE)) {
                searchResult.result.USERINPUT.TESTCASE = [searchResult.result.USERINPUT.TESTCASE]
            }
            
            let cases = 0
            for (const testCase of searchResult.result.USERINPUT.TESTCASE) {
                if (!Array.isArray(testCase.USERCASE)) {
                    testCase.USERCASE = [testCase.USERCASE]
                }
                cases += testCase.USERCASE.length
            }

            setTestOptions({
                ...searchResult.result.USERINPUT,
                cases,
            })
        } else {
            console.error("Unable to interpret server response " + JSON.stringify(searchResult))
        }
    }

    return (
        <>
            <div className="input">
                <SearchBox
                    searchState={searchState}
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
                <SearchOptions setContextFile={setContextFile} />
            </div>
            <SearchStatus
                searchState={searchState}
                testOptions={testOptions}
                result={result}
            />
            <CaseSelect
                testOptions={testOptions}
                setTestOptions={setTestOptions}
                method={method}
                tests={tests}
                searchState={searchState}
                setSearchState={setSearchState}
                setResult={setResult}
            />
            <SearchResults result={result} />
            <style jsx>{`
                .input {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: flex-start;
                    gap: 30px;
                }
            `}</style>
        </>
    )
}

export default MethodSearch