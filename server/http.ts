import type { NextRequest } from "next/server";

import { env } from "@/server/config/env";

export function isAuthorizedJobRequest(request: NextRequest) {
  if (!env.CRON_SECRET) {
    return true;
  }

  const secret =
    request.headers.get("x-cron-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.nextUrl.searchParams.get("secret");

  if (secret === env.CRON_SECRET) {
    return true;
  }

  return isSameOriginBrowserPost(request);
}

function isSameOriginBrowserPost(request: NextRequest) {
  if (request.method !== "POST" || request.headers.get("sec-fetch-site") !== "same-origin") {
    return false;
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(/:$/, "");

  return Boolean(origin && host && origin === `${protocol}://${host}`);
}
