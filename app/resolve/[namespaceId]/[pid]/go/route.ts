import { NextResponse } from "next/server";

const backendUrl = process.env.BACKEND_URL;

export async function GET(
  _request: Request,
  context: {
    params: Promise<{
      namespaceId: string;
      pid: string;
    }>;
  }
) {
  try {
    if (!backendUrl) {
      console.error("Missing BACKEND_URL");

      return new NextResponse("Server configuration error", {
        status: 500,
      });
    }

    const { namespaceId, pid } = await context.params;

    if (!namespaceId.trim() || !pid.trim()) {
      return new NextResponse("Not Found", {
        status: 404,
      });
    }

    const targetUrl =
      `${backendUrl}/resolver/namespaces/` +
      `${encodeURIComponent(namespaceId)}/resources/` +
      `${encodeURIComponent(pid)}`;

    console.log(
      "Resolving PID for redirect:",
      targetUrl
    );

    const response = await fetch(targetUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return new NextResponse("Not Found", {
          status: 404,
        });
      }

      console.error(
        "Go backend returned:",
        response.status,
        response.statusText
      );

      return new NextResponse(
        "Backend returned an error",
        {
          status: 502,
        }
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
      "PID redirect failed:",
      error
    );

    return new NextResponse(
      "Backend unavailable",
      {
        status: 502,
      }
    );
  }
}