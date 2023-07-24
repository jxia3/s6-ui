import { NextResponse } from "next/server"
import { XMLParser } from "fast-xml-parser"

// Create XML parser

const xmlParser = new XMLParser()

// Send context file upload request to server with form data

export async function POST(request) {
    try {
        // Get request file data

        const fileBlob = await request.blob()
        const formData = new FormData()
        formData.set("Context", fileBlob, "context.s6ctx")

        try {
            // Send file to server

            const uploadRequest = await fetch("http://conifer2.cs.brown.edu:8180/S6Search/sviwebfile", {
                method: "POST",
                body: formData,
                signal: AbortSignal.timeout(120000),
            })
            const uploadResult = await uploadRequest.text()

            if (uploadRequest.status !== 200) {
                return NextResponse.json({
                    error: "Server request failed with " + uploadRequest.status,
                    ...(uploadResult ? { message: uploadResult } : null),
                }, { status: 500 })
            }

            try {
                // Parse server response as XML

                const uploadData = xmlParser.parse(uploadResult)
                if (!uploadData?.HTML?.BODY?.RESULT) {
                    return NextResponse.json({ error: "Failed to parse server response" }, { status: 500 })
                }

                // Return file identifier

                return NextResponse.json({
                    fileName: uploadData.HTML.BODY.RESULT,
                })
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
        return NextResponse.json({ error: "Invalid file data" }, { status: 400 })
    }
}