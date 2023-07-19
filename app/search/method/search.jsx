import { SearchBox } from "./search-box.jsx"
import SearchStatus, { SearchState } from "../status.jsx"
import SearchResults from "../results.jsx"
import { useState } from "react"

// Method search layout

const MethodSearch = () => {
    const [ searchState, setSearchState ] = useState(SearchState.NONE)
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
        setResult(null)
        setSearchState(SearchState.VALIDATING)
        const error = validateSearch()
        const testData = await validateTests()
        if (error || testData.error) {
            setSearchState(SearchState.NONE)
            return
        }
        setSearchState(SearchState.SEARCHING)

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
                setSearchState(SearchState.ERROR)
                setResult({ error: searchResult.error })
            } else if (searchResult?.result?.SOLUTIONS) {
                setSearchState(SearchState.NONE)
                setResult(searchResult.result.SOLUTIONS)
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

        return error
    }

    // Check tests and get test data from server

    async function validateTests() {
        try {
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

            let error = false
            const newTests = [...tests]
            for (let t = 0; t < testCases.length; t ++) {
                if (testCases[t].ERROR) {
                    newTests[t] = {
                        ...newTests[t],
                        error: testCases[t].ERROR.attributes.MESSAGE,
                    }
                    error = true
                }
            }

            if (error) {
                setTests(newTests)
                return { error: true }
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
            <SearchStatus searchState={searchState} result={result} />
            <SearchResults result={result} />
        </>
    )
}

export default MethodSearch