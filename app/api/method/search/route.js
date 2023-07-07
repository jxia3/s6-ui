import { NextResponse } from "next/server"
import unraw from "unraw"
import { XMLBuilder, XMLParser } from "fast-xml-parser"

const xmlBuilder = new XMLBuilder({
    arrayNodeName: "TESTCASE",
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

export async function POST(request) {
    try {
        const data = await request.json()
        if (!data.method) {
            return NextResponse.json({ error: "Missing method data" }, { status: 400 })
        }
        if (!data.tests) {
            return NextResponse.json({ error: "Missing tests" }, { status: 400 })
        }

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
        const testData = xmlBuilder.build(data.tests.map(test => ({
            ...test,
            CALL: {
                ...test.CALL,
                INPUT: {
                    ...test.CALL.INPUT,
                    VALUE: {
                        cdata: test.CALL.INPUT.VALUE,
                    },
                },
                OUTPUT: {
                    ...test.CALL.OUTPUT,
                    VALUE: {
                        cdata: test.CALL.OUTPUT.VALUE,
                    },
                },
            }
        })))

        console.log(signatureData)
        console.log(testData)

        return NextResponse.json({})
    } catch {
        return NextResponse.json({ error: "Invalid JSON content" }, { status: 400 })
    }
}