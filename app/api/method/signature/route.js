import { NextResponse } from "next/server"
import unraw from "unraw"
import { XMLParser } from "fast-xml-parser"

const xmlParser = new XMLParser()

export async function POST(request) {
    try {
        const data = await request.json()
        if (!data.signature) {
            return NextResponse.json({ error: "Missing function signature" }, { status: 400 })
        }

        try {
            const checkResult = await fetch("http://conifer2.cs.brown.edu:8180/S6Search/sviweb", {
                method: "POST",
                headers: {
                    "Content-Type": "text/x-gwt-rpc; charset=UTF-8",
                    "X-Gwt-Module-Base": "http://conifer2.cs.brown.edu:8180/S6Search/",
                    "x-Gwt-Permutation": "CF96D742F2DD6F6198B9E8C4AAD188EB",
                },
                body: `7|0|6|http://conifer2.cs.brown.edu:8180/S6Search/|19EECCB9D9B69A8C13196E7A93090849|edu.brown.cs.s6.sviweb.client.SviwebService|sendToServer|java.lang.String/2004016611|<CHECK WHAT='METHOD'><METHOD><![CDATA[${data.signature}]]></METHOD><CONTEXT /></CHECK>|1|2|3|4|1|5|6|`,
                signal: AbortSignal.timeout(60000),
            }).then(response => response.text())

            try {
                const checkXML = unraw(checkResult.slice(checkResult.indexOf(`"`) + 1, checkResult.lastIndexOf(`"`)))
                return NextResponse.json(xmlParser.parse(checkXML))
            } catch {
                return NextResponse.json({ error: "Failed to parse server response" }, { status: 500 })
            }
        } catch {
            return NextResponse.json({ error: "Server request failed" }, { status: 400 })
        }
    } catch {
        return NextResponse.json({ error: "Invalid JSON content" }, { status: 400 })
    }
}