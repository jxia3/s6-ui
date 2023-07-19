import { useEffect } from "react"

// Test case result selection component

const CaseSelect = ({ testOptions, setSearchState, setResult }) => {
    useEffect(() => {
        console.log(testOptions)
    }, [testOptions])
}

export default CaseSelect