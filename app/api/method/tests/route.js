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

// Convert operation symbol to server id

function getOperation(comparator) {
    if (comparator === "==") {
        return "EQL"
    } else if (comparator === "!=") {
        return "NEQ"
    } else if (comparator === "throws") {
        return "THROW"
    } else if (comparator === "===") {
        return "SAME"
    } else if (comparator === "!==") {
        return "DIFF"
    } else if (comparator === "<??>") {
        return "SHOW"
    }
}

// Forward test validation request to server

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

        // Convert request data to XML

        const prefix = "7|0|6|http://conifer2.cs.brown.edu:8180/S6Search/|19EECCB9D9B69A8C13196E7A93090849|edu.brown.cs.s6.sviweb.client.SviwebService|sendToServer|java.lang.String/2004016611|<CHECK WHAT='TESTS'>"
        const postfix = "</CHECK>|1|2|3|4|1|5|6|"
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
            TEST: data.tests.map((test, index) => ({
                attributes: {
                    TESTID: index,
                    TESTNAME: "SVIWEB_" + (index + 1),
                    TYPE: "CALL",
                    METHOD: data.method.NAME,
                    OP: getOperation(test.comparator),
                },
                INPUT: {
                    cdata: test.left,
                },
                OUTPUT: {
                    cdata: test.right,
                },
            })),
        })
        const contextData = xmlBuilder.build({
            CONTEXT: {
                attributes: {
                    ...(data.contextFile ? { FILE: data.contextFile } : null),
                },
            },
        })

        try {
            // Send test validation request to server

            const checkRequest = await fetch("http://conifer2.cs.brown.edu:8180/S6Search/sviweb", {
                method: "POST",
                headers: {
                    "Content-Type": "text/x-gwt-rpc; charset=UTF-8",
                    "X-Gwt-Module-Base": "http://conifer2.cs.brown.edu:8180/S6Search/",
                    "x-Gwt-Permutation": "CF96D742F2DD6F6198B9E8C4AAD188EB",
                },
                body: prefix + signatureData + testData + contextData + postfix,
                signal: AbortSignal.timeout(60000),
            })
            const checkResult = await checkRequest.text()

            if (checkRequest.status !== 200) {
                return NextResponse.json({
                    error: "Server request failed with " + checkRequest.status,
                    ...(checkResult ? { message: checkResult } : null),
                }, { status: 500 })
            }

            try {
                // Parse server response as JSON

                const checkXML = unraw(checkResult.slice(checkResult.indexOf(`"`) + 1, checkResult.lastIndexOf(`"`)))
                const checkData = xmlParser.parse(checkXML)
                if (!checkData?.RESULT?.TESTS?.TESTCASE) {
                    return NextResponse.json({ error: "Failed to parse server response" }, { status: 500 })
                }

                // Return test data
                
                return NextResponse.json(checkData.RESULT.TESTS.TESTCASE)
            } catch {
                return NextResponse.json({ error: "Failed to parse server response" }, { status: 500 })
            }
        } catch {
            if (error instanceof DOMException && error.name === "AbortError") {
                return NextResponse.json({ error: "Server request timeout" }, { status: 500 })
            }
            return NextResponse.json({ error: "Server request failed" }, { status: 400 })
        }
    } catch {
        return NextResponse.json({ error: "Invalid JSON content" }, { status: 400 })
    }
}