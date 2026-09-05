import { clerk, publishableKey } from "./clerk.js";
import { convex } from "./convex.js";
import { api } from "../convex/_generated/api.js";

const clerkDomain = atob(publishableKey.split("_")[2]).slice(0, -1);

await new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = `https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`;
    script.async = true;
    script.crossOrigin = "anonymous";

    script.onload = resolve;
    script.onerror = () => {
        reject(new Error("Failed to load Clerk UI bundle"));
    };

    document.head.appendChild(script);
});

await clerk.load({
    ui: {
        ClerkUI: window.__internal_ClerkUICtor,
    },
});

convex.setAuth(async () => {
    return await clerk.session?.getToken({
        template: "convex",
    }) ?? null;
});

const signInDiv = document.getElementById("sign-in");

async function continueAfterAuth() {
    try {
        const user = await convex.query(
            api.users.getCurrentUser,
            {}
        );

        console.log("ALUMNIFORGE USER:", user);

        if (user === null) {
            window.location.href = "/registration.html";
            return;
        }

        window.location.href = "/dashboard.html";
    } catch (error) {
        console.error("FAILED TO CHECK ALUMNIFORGE PROFILE:", error);
    }
}

if (clerk.isSignedIn) {
    await continueAfterAuth();
} else {
    clerk.mountSignIn(signInDiv, {
        forceRedirectUrl: "/login.html",
        signUpForceRedirectUrl: "/login.html"
    });
}