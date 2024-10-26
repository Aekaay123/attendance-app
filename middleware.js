import NextAuth from "next-auth";
import { authconfig } from "./app/api/auth/[...nextauth]/auth";
import { DEFAULT_REDIRECT, PUBLIC_ROUTES, ROOT } from "./lib/protectedroute";

const { auth } = NextAuth(authconfig);

export default auth(async (req) => {
  const { nextUrl } = req; // Get the requested URL
  const isAuthenticated = !!req.auth; // Check if user is authenticated
  const role = req.auth?.user?.role || null; // Get the user role
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname); // Check if the requested route is public
  // If user is authenticated
  if (isAuthenticated) {
    // If they try to access a public route, redirect to their respective page
    if (isPublicRoute) {
      const redirectTo =
        role === "admin" ? DEFAULT_REDIRECT.admin : DEFAULT_REDIRECT.user;
      return Response.redirect(new URL(redirectTo, nextUrl));
    }

    // Allow access to /admin for admins and /dashboard for users
    if (role === "admin" && nextUrl.pathname.startsWith("/admin")) {
      return; // Allow access for admin
    }
    if (role === "user" && nextUrl.pathname.startsWith("/employee")) {
      return; // Allow access for user
    }

    // For any other routes, redirect to the default page
    const redirectTo =
      role === "admin" ? DEFAULT_REDIRECT.admin : DEFAULT_REDIRECT.user;
    return Response.redirect(new URL(redirectTo, nextUrl));
  }

  // If user is not authenticated and tries to access a protected route, redirect to root
  if (!isAuthenticated && !isPublicRoute) {
    return Response.redirect(new URL(ROOT, nextUrl)); // Redirect to root
  }
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/employee/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
