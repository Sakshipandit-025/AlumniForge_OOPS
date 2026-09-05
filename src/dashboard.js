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
    console.log("No signed-in Clerk user.");
} else {
    const user = await convex.query(api.users.getCurrentUser, {});

    const name = user?.name;
    const email = user?.email;
    const collegeEmail = user?.collegeEmail;
    const dateOfBirth = user?.dateOfBirth;
    const graduationYear = user?.graduationYear;
    const branch = user?.branch;
    const role = user?.role;
    const createdAt = user?.createdAt;

    console.log("ALUMNIFORGE USER:", user);
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("College Email:", collegeEmail);
    console.log("DOB:", dateOfBirth);
    console.log("Grad yr:", graduationYear);
    console.log("Branch:", branch);
    console.log("Role:", role);
    console.log("Created at:", createdAt);
}

//test
const signOutButton = document.createElement("button");
signOutButton.textContent = "Test Sign Out";

signOutButton.addEventListener("click", async () => {
    await clerk.signOut();
    window.location.href = "/login.html";
});

document.body.appendChild(signOutButton);
