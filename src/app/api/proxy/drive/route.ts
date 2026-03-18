import { google } from "googleapis";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();

  // Validate if the user is B2B Admin to view CVs/Audios
  if (!session || (session.user as any)?.userRole !== "admin") {
     return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("id");

  if (!fileId) {
    return new NextResponse("Missing file ID", { status: 400 });
  }

  try {
    const credsStr = process.env.GOOGLE_DRIVE_CREDENTIALS;
    if (!credsStr) throw new Error("No credentials configured");

    const credentials = JSON.parse(credsStr);
    const authClient = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth: authClient });

    // 1. Deducir mimeType original y nombre pidiendo los metadatos primero
    const metadataResponse = await drive.files.get({
      fileId,
      fields: "name, mimeType",
      supportsAllDrives: true,
    });
    
    const fileName = metadataResponse.data.name || "document";
    const mimeType = metadataResponse.data.mimeType || "application/pdf"; // Fallback to pdf as best guess for CVs
    
    // 2. Traer el archivo real en un Stream
    const response = await drive.files.get(
      { fileId, alt: "media", supportsAllDrives: true },
      { responseType: "stream" }
    );

    // Transform Node.js Readable stream to Web ReadableStream
    const reactReadableStream = new ReadableStream({
      start(controller) {
        response.data.on('data', (chunk) => controller.enqueue(chunk));
        response.data.on('end', () => controller.close());
        response.data.on('error', (err) => controller.error(err));
      }
    });

    return new NextResponse(reactReadableStream, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error streaming from Drive:", error);
    return new NextResponse("File not found or stream error", { status: 500 });
  }
}
