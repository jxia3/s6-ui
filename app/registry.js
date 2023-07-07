'use client'

import { useServerInsertedHTML } from "next/navigation"
import { useState } from "react"
import { StyleRegistry, createStyleRegistry } from "styled-jsx"

// Styled JSX client registry

export default function StyledJsxRegistry({ children }) {
    const [ jsxStyleRegistry ] = useState(() => createStyleRegistry())

    useServerInsertedHTML(() => {
        const styles = jsxStyleRegistry.styles()
        jsxStyleRegistry.flush()
        return <>{styles}</>
    })

    return <StyleRegistry registry={jsxStyleRegistry}>{children}</StyleRegistry>
}