import { NextResponse } from "next/server"
import unraw from "unraw"
import { XMLParser } from "fast-xml-parser"

// Create XML parser

const xmlParser = new XMLParser()

// Forward license request to server

export async function GET(request) {
    try {
        // Get license id from query string

        const licenseId = request.nextUrl.searchParams.get("id")
        if (!licenseId) {
            return NextResponse.json({ error: "Missing license ID" }, { status: 400 })
        }

        try {
            // Send license request to server

            const licenseRequest = await fetch("http://conifer2.cs.brown.edu:8180/S6Search/sviweb", {
                method: "POST",
                headers: {
                    "Content-Type": "text/x-gwt-rpc; charset=UTF-8",
                    "X-Gwt-Module-Base": "http://conifer2.cs.brown.edu:8180/S6Search/",
                    "x-Gwt-Permutation": "CF96D742F2DD6F6198B9E8C4AAD188EB",
                },
                body: `7|0|6|http://conifer2.cs.brown.edu:8180/S6Search/|19EECCB9D9B69A8C13196E7A93090849|edu.brown.cs.s6.sviweb.client.SviwebService|sendToServer|java.lang.String/2004016611|<CHECK WHAT='LICENSE'><UID><![CDATA[${licenseId}]]></UID></CHECK>|1|2|3|4|1|5|6|`,
                signal: AbortSignal.timeout(60000),
            })
            const licenseResult = await licenseRequest.text()

            if (licenseRequest.status !== 200) {
                return NextResponse.json({
                    error: "Server request failed with " + licenseRequest.status,
                    ...(licenseResult ? { message: licenseResult } : null),
                }, { status: 500 })
            }

            try {
                // Return raw license text

                const licenseXML = unraw(licenseResult.slice(licenseResult.indexOf(`"`) + 1, licenseResult.lastIndexOf(`"`)))
                const licenseData = xmlParser.parse(licenseXML)
                if (licenseData?.RESULT?.LICENSE?.TEXT) {
                    return new Response(licenseData.RESULT.LICENSE.TEXT)
                } else {
                    return new Response("Encountered invalid license ID")
                }
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
        return NextResponse.json({ error: "Bad request" }, { status: 400 })
    }
}