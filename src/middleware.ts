import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ADMIN_PREFIX = "/admin";
const CLIENT_PROTECTED_PREFIXES = ["/account", "/checkout"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith(ADMIN_PREFIX);
  const isClientProtectedRoute = CLIENT_PROTECTED_PREFIXES.some((p) =>
    nextUrl.pathname.startsWith(p)
  );

  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  if (isClientProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout/:path*"],
};
