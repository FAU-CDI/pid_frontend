import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL;

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      mount: string;
      pid: string;
    }>;
  }
) {
  try {
    if (!backendUrl) {
      console.error("Missing BACKEND_URL");

      return new NextResponse(
        "Server configuration error",
        { status: 500 }
      );
    }

    const { mount, pid } = await context.params;

    if (!mount.trim() || !pid.trim()) {
      return new NextResponse(
        "Not Found",
        { status: 404 }
      );
    }

    const protocol =
      request.headers.get("x-forwarded-proto") || "http";

    const host =
      request.headers.get("host");

    if (!host) {
      return new NextResponse(
        "Unable to determine host",
        { status: 500 }
      );
    }

    const baseUri =
      `${protocol}://${host}/${mount}/`;

    const targetUrl =
      `${backendUrl}/resolver/mounts/` +
      `${encodeURIComponent(baseUri)}/` +
      `${encodeURIComponent(pid)}`;

    console.log(
      "Mount base URI:",
      baseUri
    );

    console.log(
      "Requesting Go mount backend:",
      targetUrl
    );

    const response = await fetch(targetUrl, {
      cache: "no-store",
    });

    console.log(
      "Go response:",
      response.status,
      response.statusText
    );

    if (!response.ok) {
      if (response.status === 404) {
        return new NextResponse(
          "Not Found",
          { status: 404 }
        );
      }

      return new NextResponse(
        "Backend returned an error",
        { status: 502 }
      );
    }

    const data = await response.json();

    if (!data.url) {
      return new NextResponse(
        `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>URL Not Found</title>
              <style>
                body {
                  margin: 0;
                  font-family: Arial, sans-serif;
                  background: white;
                }
      
                main {
                  min-height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 2rem;
                  box-sizing: border-box;
                }
      
                div {
                  text-align: center;
                }
      
                h1 {
                  font-size: 1.875rem;
                  font-weight: 700;
                  color: #dc2626;
                  margin: 0;
                }
      
                p {
                  margin-top: 1rem;
                  color: #4b5563;
                }
              </style>
            </head>
      
            <body>
              <main>
                <div>
                  <h1>URL Not Found</h1>
      
                  <p>
                    This PID does not have a URL associated with it.
                  </p>
                </div>
              </main>
            </body>
          </html>
        `,
        {
          status: 404,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        }
      );
    }

    return NextResponse.redirect(data.url);
  } catch (error) {
    console.error(
      "Mount redirect failed:",
      error
    );

    return new NextResponse(
      "Backend unavailable",
      { status: 502 }
    );
  }
}