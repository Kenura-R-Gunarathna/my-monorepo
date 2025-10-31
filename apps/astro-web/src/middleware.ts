import { auth } from "@krag/database-astro";
import { defineMiddleware } from "astro:middleware";

// `context` and `next` are automatically typed
export const onRequest = defineMiddleware(async (context, next) => {
	const isAuthed = await auth.api
		.getSession({
			headers: context.request.headers,
		})
		.catch((e) => {
			console.error("Auth session error:", e);
			return null;
		});
	
	// Protect dashboard and other authenticated routes
	const protectedRoutes = ["/dashboard"];
	const isProtectedRoute = protectedRoutes.some(route => 
		context.url.pathname.startsWith(route)
	);
	
	if (isProtectedRoute && !isAuthed) {
		return context.redirect("/sign-in");
	}
	
	// Store session in locals for access in pages
	context.locals.session = isAuthed;
	
	return next();
});
