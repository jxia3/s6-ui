import { NextResponse } from "next/server"
import unraw from "unraw"
import { XMLParser } from "fast-xml-parser"

// Create XML parser

const xmlParser = new XMLParser()

// Forward function signature validation request to server

export async function POST(request) {
    try {
        // Validate request JSON data

        const data = await request.json()
        if (!data.signature) {
            return NextResponse.json({ error: "Missing function signature" }, { status: 400 })
        }

        try {
            // Send function signature check to server

            const checkRequest = await fetch("http://conifer2.cs.brown.edu:8180/S6Search/sviweb", {
                method: "POST",
                headers: {
                    "Content-Type": "text/x-gwt-rpc; charset=UTF-8",
                    "X-Gwt-Module-Base": "http://conifer2.cs.brown.edu:8180/S6Search/",
                    "x-Gwt-Permutation": "CF96D742F2DD6F6198B9E8C4AAD188EB",
                },
                body: `7|0|6|http://conifer2.cs.brown.edu:8180/S6Search/|19EECCB9D9B69A8C13196E7A93090849|edu.brown.cs.s6.sviweb.client.SviwebService|sendToServer|java.lang.String/2004016611|<CHECK WHAT='METHOD'><METHOD><![CDATA[${data.signature}]]></METHOD><CONTEXT /></CHECK>|1|2|3|4|1|5|6|`,
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
                // Return function data
                
                const checkXML = unraw(checkResult.slice(checkResult.indexOf(`"`) + 1, checkResult.lastIndexOf(`"`)))
                return NextResponse.json(xmlParser.parse(checkXML))
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