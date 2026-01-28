import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const color = searchParams.get("color");

  try {
    const filePath = path.join(process.cwd(), "public", "KeyRush_Logo.svg");
    let svgContent = fs.readFileSync(filePath, "utf8");

    if (color) {
      // Validate hex color
      const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
      const decodedColor = decodeURIComponent(color);
      
      // Ensure it starts with #
      const hexColor = decodedColor.startsWith("#") ? decodedColor : `#${decodedColor}`;

      if (hexColorRegex.test(hexColor)) {
        // Replace the gradient fill with the solid color
        // The original SVG has style="fill:url(#_Radial1);"
        svgContent = svgContent.replace(
          /style="fill:url\(#_Radial1\);"/g,
          `fill="${hexColor}"`
        );
      }
    }

    return new NextResponse(svgContent, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Error generating favicon", { status: 500 });
  }
}
