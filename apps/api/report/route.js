// API route for reports
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Forward the request to your Express backend
    const url = new URL(`${process.env.API_BASE_URL || "http://localhost:5000"}/api/reports`);

    if (status) {
      url.searchParams.append("status", status);
    }

    console.log("Fetching reports from URL:", url.toString());
    console.log("Using auth header:", authHeader);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });

    // ดึงข้อความ response ก่อนแปลงเป็น JSON
    const responseText = await response.text();
    console.log("Response from backend:", responseText);

    // พยายามแปลง response เป็น JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Error parsing JSON response:", e);
      return new Response(
        JSON.stringify({
          error: "Error parsing response from server",
          rawResponse: responseText,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return the response from your Express backend
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("API route error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}