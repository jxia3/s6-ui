import { NextResponse } from "next/server"
import { XMLBuilder, XMLParser } from "fast-xml-parser"

const xmlBuilder = new XMLBuilder({
    arrayNodeName: "TEST",
    ignoreAttributes: false,
    attributeNamePrefix: "#",
    suppressBooleanAttributes: false,
    cdataPropName: "cdata",
})

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

export async function POST(request) {
    try {
        const data = await request.json()
        if (!data.method) {
            return NextResponse.json({ error: "Missing method data" }, { status: 400 })
        }
        if (!data.tests) {
            return NextResponse.json({ error: "Missing tests" }, { status: 400 })
        }

        console.log(data)

        const prefix = "7|0|6|http://conifer2.cs.brown.edu:8180/S6Search/|19EECCB9D9B69A8C13196E7A93090849|edu.brown.cs.s6.sviweb.client.SviwebService|sendToServer|java.lang.String/2004016611|<CHECK WHAT='TESTS'>"
        const postfix = "<CONTEXT /></CHECK>|1|2|3|4|1|5|6|"
        const signatureData = xmlBuilder.build({
            SIGNATURE: {
                METHOD: {
                    "#MODS": 0,
                    ...(data.method.RETURN === "int" ? { "#INT": true } : null),
                    ...(data.method.RETURN === "float" ? { "#FLOAT": true } : null),
                    ...(data.method.RETURN === "double" ? { "#DOUBLE": true } : null),
                    ...(data.method.RETURN === "short" ? { "#SHORT": true } : null),
                    ...(data.method.RETURN === "long" ? { "#LONG": true } : null),
                    ...(data.method.RETURN === "boolean" ? { "#BOOLEAN": true } : null),
                    ...(data.method.RETURN === "byte" ? { "#BYTE": true } : null),
                    ...(data.method.RETURN === "char" ? { "#CHAR": true } : null),
                    ...(data.method.RETURN === "java.lang.String" ? { "#STRING": true } : null),
                    ...data.method,
                },
            },
        })
        const testData = xmlBuilder.build(data.tests.map((test, index) => ({
            "#TESTID": index,
            "#TESTNAME": "SVIWEB_" + (index + 1),
            "#TYPE": "CALL",
            "#METHOD": data.method.NAME,
            "#OP": getOperation(test.comparator),
            INPUT: {
                cdata: test.left,
            },
            OUTPUT: {
                cdata: test.right,
            },
        })))

        console.log(signatureData)
        console.log(testData)
    } catch {
        return NextResponse.json({ error: "Invalid JSON content" }, { status: 400 })
    }
}