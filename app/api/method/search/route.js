import { NextResponse } from "next/server"
import unraw from "unraw"
import { XMLBuilder, XMLParser } from "fast-xml-parser"

// Create XML builder and parser

const xmlBuilder = new XMLBuilder({
    ignoreAttributes: false,
    attributesGroupName: "attributes",
    suppressBooleanAttributes: false,
    cdataPropName: "cdata",
})
const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributesGroupName: "attributes",
    attributeNamePrefix: "",
})

// Forward method search request to server

export async function POST(request) {
    try {
        // Validate request JSON data

        const data = await request.json()
        if (!data.method) {
            return NextResponse.json({ error: "Missing method data" }, { status: 400 })
        }
        if (!data.tests) {
            return NextResponse.json({ error: "Missing tests" }, { status: 400 })
        }
        if (!data.description) {
            return NextResponse.json({ error: "Missing description" }, { status: 400 })
        }

        // Convert request data to XML

        const prefix = "7|0|6|http://conifer2.cs.brown.edu:8180/S6Search/|19EECCB9D9B69A8C13196E7A93090849|edu.brown.cs.s6.sviweb.client.SviwebService|sendToServer|java.lang.String/2004016611|<SEARCH WHAT='METHOD' FORMAT='NONE' REMOTE='TRUE' SEARCHCODE='TRUE'>"
        const postfix = "</SEARCH>|1|2|3|4|1|5|6|"
        const signatureData = xmlBuilder.build({
            SIGNATURE: {
                METHOD: {
                    attributes: {
                        MODS: 0,
                        ...(data.method.RETURN === "int" ? { INT: true } : null),
                        ...(data.method.RETURN === "float" ? { FLOAT: true } : null),
                        ...(data.method.RETURN === "double" ? { DOUBLE: true } : null),
                        ...(data.method.RETURN === "short" ? { SHORT: true } : null),
                        ...(data.method.RETURN === "long" ? { LONG: true } : null),
                        ...(data.method.RETURN === "boolean" ? { BOOLEAN: true } : null),
                        ...(data.method.RETURN === "byte" ? { BYTE: true } : null),
                        ...(data.method.RETURN === "char" ? { CHAR: true } : null),
                        ...(data.method.RETURN === "java.lang.String" ? { STRING: true } : null),
                    },
                    ...data.method,
                },
            },
        })
        const testData = xmlBuilder.build({
            TESTS: {
                TESTCASE: data.tests.map(test => {
                    const testData = { ...test }
                    testData.CALL.INPUT.VALUE = {
                        cdata: testData.CALL.INPUT.VALUE,
                    }
                    if (testData.CALL?.OUTPUT?.VALUE) {
                        testData.CALL.OUTPUT.VALUE = {
                            cdata: testData.CALL.OUTPUT.VALUE,
                        }
                    }
                    return testData
                }),
            },
        })
        const optionsData = xmlBuilder.build({
            SECURITY: {},
            CONTRACTS: {},
            CONTEXT: {
                attributes: {
                    ...(data.contextFile ? { FILE: data.contextFile } : null),
                },
            },
            KEYWORDS: {
                KEYWORD: [...data.description.split(" ").map(word => ({
                    cdata: word,
                }))],
            },
        })

        try {
            // Send search request to server

            const searchRequest = await fetch("http://conifer2.cs.brown.edu:8180/S6Search/sviweb", {
                method: "POST",
                headers: {
                    "Content-Type": "text/x-gwt-rpc; charset=UTF-8",
                    "X-Gwt-Module-Base": "http://conifer2.cs.brown.edu:8180/S6Search/",
                    "x-Gwt-Permutation": "CF96D742F2DD6F6198B9E8C4AAD188EB",
                },
                body: prefix + signatureData + testData + optionsData + postfix,
                signal: AbortSignal.timeout(300000),
            })
            const searchResult = await searchRequest.text()

            if (searchRequest.status !== 200) {
                return NextResponse.json({
                    error: "Server request failed with " + searchRequest.status,
                    ...(searchResult ? { message: searchResult } : null),
                }, { status: 500 })
            }
            
            try {
                // Parse server response as JSON

                const resultXML = unraw(searchResult.slice(searchResult.indexOf(`"`) + 1, searchResult.lastIndexOf(`"`)))
                const resultData = xmlParser.parse(resultXML)

                // Return search results or error

                if (resultData?.RESULT) {
                    return NextResponse.json({ result: resultData.RESULT })
                } else if (resultData?.PROBLEM) {
                    return NextResponse.json({ error: resultData.PROBLEM })
                }
                return NextResponse.json({ error: "Failed to parse server response" }, { status: 500 })
            } catch(error) {
                console.error(error)
                return NextResponse.json({ error: "Failed to parse server response" }, { status: 500 })
            }
        } catch(error) {
            console.error(error)
            if (error instanceof DOMException && error.name === "AbortError") {
                return NextResponse.json({ error: "Server request timeout" }, { status: 500 })
            }
            return NextResponse.json({ error: "Server request failed" }, { status: 400 })
        }
    } catch(error) {
        console.error(error)
        return NextResponse.json({ error: "Invalid JSON content" }, { status: 400 })
    }
}