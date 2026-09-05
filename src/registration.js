import { clerk } from "./clerk.js";
import { convex } from "./convex.js";
import { api } from "../convex/_generated/api.js";

await clerk.load();

convex.setAuth(async () => {
    return await clerk.session?.getToken({
        template: "convex",
    }) ?? null;
});

if (!clerk.isSignedIn) {
    window.location.href = "/login.html";
} else {
    const form = document.getElementById("registration-form");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const collegeEmail = document.getElementById("email").value;
        const dateOfBirth = document.getElementById("dob").value;
        const graduationYear = Number(
            document.getElementById("graduationYear").value
        );
        const branch = document.getElementById("branch").value;

        try {
            const user = await convex.mutation(
                api.users.createUser,
                {
                    collegeEmail,
                    dateOfBirth,
                    graduationYear,
                    branch,
                }
            );

            console.log("ALUMNIFORGE USER CREATED:", user);

            window.location.href = "/dashboard.html";
        } catch (error) {
            console.error(
                "FAILED TO CREATE ALUMNIFORGE USER:",
                error
            );

            alert("Unable to save your profile. Please try again.");
        }
    });
}