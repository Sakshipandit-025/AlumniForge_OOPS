import { Clerk } from "@clerk/clerk-js";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
    throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env");
}

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

const clerk = new Clerk(publishableKey);

await clerk.load({
    ui: {
        ClerkUI: window.__internal_ClerkUICtor,
    },
});

console.log("Clerk loaded successfully!");
console.log("Signed in:", clerk.isSignedIn);