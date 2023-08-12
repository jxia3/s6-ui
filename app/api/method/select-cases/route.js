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
        if (!data.userId) {
            return NextResponse.json({ error: "Missing user ID" }, { status: 400 })
        }
        if (!data.testCases) {
            return NextResponse.json({ error: "Missing test case data" }, { status: 400 })
        }

        // Convert request data to XML

        const prefix = "7|0|6|http://conifer2.cs.brown.edu:8180/S6Search/|19EECCB9D9B69A8C13196E7A93090849|edu.brown.cs.s6.sviweb.client.SviwebService|sendToServer|java.lang.String/2004016611|"
        const postfix = "|1|2|3|4|1|5|6|"
        const selectData = xmlBuilder.build({
            USERREPLY: {
                attributes: {
                    UID: data.userId,
                },
                TESTCASE: Object.keys(data.testCases).map(caseId => ({
                    attributes: {
                        NAME: caseId,
                    },
                    USERCASE: data.testCases[caseId].selected.map(ids => ({
                        attributes: {
                            IDS: ids,
                            STATE: "PASS",
                        },
                    })).concat(data.testCases[caseId].rejected.map(ids => ({
                        attributes: {
                            IDS: ids,
                            STATE: "FAIL",
                        },
                    }))),
                })),
            },
        })

        try {
            // Send select request to server

            const selectRequest = await fetch("http://conifer2.cs.brown.edu:8180/S6Search/sviweb", {
                method: "POST",
                headers: {
                    "Content-Type": "text/x-gwt-rpc; charset=UTF-8",
                    "X-Gwt-Module-Base": "http://conifer2.cs.brown.edu:8180/S6Search/",
                    "x-Gwt-Permutation": "CF96D742F2DD6F6198B9E8C4AAD188EB",
                },
                body: prefix + selectData + postfix,
                signal: AbortSignal.timeout(60000),
            })
            const selectResult = await selectRequest.text()

            if (selectRequest.status !== 200) {
                return NextResponse.json({
                    error: "Server request failed with " + selectRequest.status,
                    ...(selectResult ? { message: selectResult } : null),
                }, { status: 500 })
            }

            try {
                // Parse server response as JSON

                const selectXML = unraw(selectResult.slice(selectResult.indexOf(`"`) + 1, selectResult.lastIndexOf(`"`)))
                const selectData = xmlParser.parse(selectXML)

                // Return selection results or error

                if (selectData?.RESULT) {
                    return NextResponse.json({ result: selectData.RESULT })
                } else if (selectData?.PROBLEM) {
                    return NextResponse.json({ error: selectData.PROBLEM })
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