import { clerk } from "./clerk.js";
import { convex } from "./convex.js";
import { api } from "../convex/_generated/api.js";

await clerk.load();

convex.setAuth(async () => {
    return await clerk.session?.getToken({
        template: "convex",
    }) ?? null;
});

const status = document.getElementById("status");
const postsContainer = document.getElementById("posts");
const postForm = document.getElementById("post-form");


// Check authentication and AlumniForge profile
async function checkUser() {
    if (!clerk.isSignedIn) {
        status.textContent = "You are not signed in. Please log in first.";
        postForm.style.display = "none";
        return false;
    }

    const user = await convex.query(
        api.users.getCurrentUser,
        {}
    );

    if (user === null) {
        status.textContent = "AlumniForge profile not found.";
        postForm.style.display = "none";
        return false;
    }

    status.textContent = `Signed in as ${user.name ?? "User"}`;

    return true;
}


// Display all Forum posts
async function loadPosts() {
    const posts = await convex.query(
        api.forum.listPosts,
        {}
    );

    postsContainer.innerHTML = "";

    if (posts.length === 0) {
        postsContainer.textContent = "No posts yet.";
        return;
    }

    for (const post of posts) {
        const postElement = document.createElement("article");

        const title = document.createElement("h3");
        title.textContent = post.title;

        const content = document.createElement("p");
        content.textContent = post.content;

        const author = document.createElement("small");
        author.textContent = `Posted by ${post.authorName}`;

        postElement.appendChild(title);
        postElement.appendChild(content);
        postElement.appendChild(author);

        postElement.appendChild(document.createElement("hr"));


        // Get this post and its comments
        const postDetails = await convex.query(
            api.forum.getPost,
            {
                postId: post._id,
            }
        );


        // Display comments
        const commentsHeading = document.createElement("h4");
        commentsHeading.textContent = "Comments";

        //may consider removing the comment heading bit if feels unnecessary
        postElement.appendChild(commentsHeading);

        const commentsContainer = document.createElement("div");
                                    
        if (postDetails.comments.length === 0) {
            commentsContainer.textContent = "No comments yet.";
        } else {
            for (const comment of postDetails.comments) {
                const commentElement = document.createElement("p");

                commentElement.textContent =
                    `${comment.authorName}: ${comment.content}`;

                commentsContainer.appendChild(commentElement);
            }
        }

        postElement.appendChild(commentsContainer);


        // Add comment form
        const commentForm = document.createElement("form");

        const commentInput = document.createElement("input");
        commentInput.type = "text";
        commentInput.placeholder = "Write a comment...";
        commentInput.required = true;

        const commentButton = document.createElement("button");
        commentButton.type = "submit";
        commentButton.textContent = "Add Comment";

        commentForm.appendChild(commentInput);
        commentForm.appendChild(commentButton);

        commentForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const comment = commentInput.value.trim();

            if (!comment) {
                return;
            }

            try {
                await convex.mutation(
                    api.forum.addComment,
                    {
                        postId: post._id,
                        content: comment,
                    }
                );

                await loadPosts();
            } catch (error) {
                alert(error.message);
            }
        });

        postElement.appendChild(commentForm);

        postElement.appendChild(document.createElement("br"));


        // Delete post
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";

        // Handle this in the final UI.
        // Preferably don't show Delete unless it's the user's own post.
        deleteButton.addEventListener("click", async () => {
            try {
                await convex.mutation(
                    api.forum.deletePost,
                    {
                        postId: post._id,
                    }
                );

                await loadPosts();
            } catch (error) {
                alert(error.message);
            }
        });

        postElement.appendChild(deleteButton);

        postsContainer.appendChild(postElement);
        postsContainer.appendChild(document.createElement("hr"));
    }
}


// Create a new Forum post
postForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        return;
    }

    try {
        await convex.mutation(
            api.forum.createPost,
            {
                title,
                content,
            }
        );

        postForm.reset();

        await loadPosts();
    } catch (error) {
        alert(error.message);
    }
});


// Start the Forum test page
const userReady = await checkUser();

if (userReady) {
    await loadPosts();
}
