import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const payload = getUserFromRequest(req);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { appName, webhookUrl } = await req.json();

    if (!appName) {
      return NextResponse.json({ error: "appName is required" }, { status: 400 });
    }

    const apiKey = `cdk_${uuidv4().replace(/-/g, "")}`;

    const app = await prisma.developerApp.create({
      data: {
        userId: payload.userId,
        appName,
        apiKey,
        webhookUrl: webhookUrl || null,
      },
    });

    return NextResponse.json({
      app: {
        id: app.id,
        appName: app.appName,
        apiKey: app.apiKey,
        webhookUrl: app.webhookUrl,
      },
    });
  } catch (error) {
    console.error("Dev register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
