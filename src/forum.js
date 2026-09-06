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

let currentUser = null;

// ================= CHECK USER =================

async function checkUser() {
    if (!clerk.isSignedIn) {
        status.textContent = "You are not signed in. Please log in first.";
        postForm.style.display = "none";
        return false;
    }

    try {
        const user = await convex.query(
            api.users.getCurrentUser,
            {}
        );

        if (user === null) {
            status.textContent = "AlumniForge profile not found.";
            postForm.style.display = "none";
            return false;
        }

        currentUser = user;

        status.textContent = `Signed in as ${user.name ?? "User"}`;
        return true;
    } catch (error) {
        console.error(error);
        status.textContent = "Unable to load your AlumniForge profile.";
        postForm.style.display = "none";
        return false;
    }
}

// ================= LOAD POSTS =================

async function loadPosts() {
    try {
        const posts = await convex.query(
            api.forum.listPosts,
            {}
        );

        postsContainer.innerHTML = "";

        if (!posts || posts.length === 0) {
            const emptyMessage = document.createElement("div");
            emptyMessage.className = "empty-message";
            emptyMessage.textContent =
                "No discussions yet. Be the first to start one!";

            postsContainer.appendChild(emptyMessage);
            return;
        }

        for (const post of posts) {
            const postElement = document.createElement("article");
            postElement.className = "post-card";

            // ================= AUTHOR =================

            const author = document.createElement("div");
            author.className = "post-author";
            author.textContent =
                `Posted by ${post.authorName ?? "User"}`;

            // ================= TITLE =================

            const title = document.createElement("h3");
            title.textContent = post.title;

            // ================= CONTENT =================

            const content = document.createElement("p");
            content.className = "post-content";
            content.textContent = post.content;

            postElement.appendChild(author);
            postElement.appendChild(title);
            postElement.appendChild(content);

            // ================= COMMENTS =================

            const commentsSection = document.createElement("div");
            commentsSection.className = "comments-section";

            const commentsHeading = document.createElement("h4");
            commentsHeading.textContent = "Comments";

            commentsSection.appendChild(commentsHeading);

            const commentsContainer = document.createElement("div");

            // Show the post first
            postsContainer.appendChild(postElement);

            // Then load comments
            try {
                const postDetails = await convex.query(
                    api.forum.getPost,
                    {
                        postId: post._id
                    }
                );

                if (
                    !postDetails ||
                    !postDetails.comments ||
                    postDetails.comments.length === 0
                ) {
                    const noComments = document.createElement("div");
                    noComments.className = "comment";
                    noComments.textContent = "No comments yet.";

                    commentsContainer.appendChild(noComments);
                } else {
                    for (const comment of postDetails.comments) {
                        const commentElement =
                            document.createElement("div");

                        commentElement.className = "comment";
                        commentElement.textContent =
                            `${comment.authorName ?? "User"}: ${comment.content}`;

                        commentsContainer.appendChild(commentElement);
                    }
                }
            } catch (error) {
                console.error("Could not load comments:", error);

                const commentError = document.createElement("div");
                commentError.className = "comment";
                commentError.textContent =
                    "Comments could not be loaded.";

                commentsContainer.appendChild(commentError);
            }

            commentsSection.appendChild(commentsContainer);

            // ================= COMMENT FORM =================

            const commentForm = document.createElement("form");
            commentForm.className = "comment-form";

            const commentInput = document.createElement("input");
            commentInput.type = "text";
            commentInput.placeholder = "Write a comment...";
            commentInput.required = true;

            const commentButton = document.createElement("button");
            commentButton.type = "submit";
            commentButton.textContent = "Reply";

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
                            content: comment
                        }
                    );

                    await loadPosts();
                } catch (error) {
                    alert(
                        error.message ||
                        "Unable to add comment."
                    );
                }
            });

            commentsSection.appendChild(commentForm);
            postElement.appendChild(commentsSection);

            // ================= DELETE =================

            if (currentUser && post.authorId === currentUser._id) {
                const deleteButton = document.createElement("button");
                deleteButton.className = "delete-button";
                deleteButton.textContent = "Delete post";

                deleteButton.addEventListener("click", async () => {
                    const confirmed = confirm(
                        "Are you sure you want to delete this post?"
                    );

                    if (!confirmed) {
                        return;
                    }

                    try {
                        await convex.mutation(
                            api.forum.deletePost,
                            {
                                postId: post._id
                            }
                        );

                        await loadPosts();
                    } catch (error) {
                        alert(
                            error.message ||
                            "Unable to delete this post."
                        );
                    }
                });

                postElement.appendChild(deleteButton);
            }
        }
    } catch (error) {
        console.error("Unable to load forum posts:", error);

        postsContainer.innerHTML = "";

        const errorMessage = document.createElement("div");
        errorMessage.className = "empty-message";
        errorMessage.textContent = "Unable to load forum posts.";

        postsContainer.appendChild(errorMessage);
    }
}

// ================= CREATE NEW POST =================

postForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const titleInput = document.getElementById("post-title");
    const contentInput = document.getElementById("post-content");

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        alert("Please enter both a title and some content.");
        return;
    }

    const submitButton = postForm.querySelector("button");

    submitButton.disabled = true;
    submitButton.textContent = "Posting...";

    try {
        await convex.mutation(
            api.forum.createPost,
            {
                title,
                content
            }
        );

        postForm.reset();

        await loadPosts();
    } catch (error) {
        console.error(error);

        alert(
            error.message ||
            "Unable to create the post."
        );
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Post Discussion";
    }
});

// ================= START =================

const userReady = await checkUser();

if (userReady) {
    await loadPosts();
}