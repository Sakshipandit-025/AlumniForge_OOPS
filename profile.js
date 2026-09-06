const PROFILE_KEY = "alumniForgeProfile";
const PHOTO_KEY = "alumniForgeProfilePhoto";
const THEME_KEY = "alumniForgeTheme";


const DEFAULT_PROFILE = {
    aboutMe: "",

    college: "",
    phone: "",
    location: "",
    dateOfBirth: "",
    gender: "",

    degree: "",
    educationCollege: "",
    branch: "",
    startYear: "",
    endYear: "",

    skills: [],

    resumeName: "",

    experience: [],
    certifications: [],
    courses: [],

    progress: {
        coursesCompleted: 0,
        coursesInProgress: 0,
        learningInterests: ""
    },

    contributions: {
        posts: 0,
        comments: 0,
        resources: 0
    },

    professionalLinks: {
        linkedin: "",
        github: "",
        portfolio: ""
    },

    quiz: {
        attempted: 0,
        completed: 0,
        averageScore: 0
    },

    visibility: "public",

    registration: {
        collegeEmail: "",
        dateOfBirth: "",
        graduationYear: "",
        branch: ""
    }
};




function $(id) {
    return document.getElementById(id);
}

function readStorage(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        return JSON.parse(value);
    } catch (error) {
        console.warn(
            `Could not read localStorage key: ${key}`,
            error
        );

        return fallback;
    }
}


function writeStorage(key, value) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;
    } catch (error) {
        console.error(
            `Could not save localStorage key: ${key}`,
            error
        );

        showToast(
            "Unable to save locally. Storage may be full."
        );

        return false;
    }
}




function normalizeProfile(data) {
    const source =
        data && typeof data === "object"
            ? data
            : {};

    const profile = {
        ...DEFAULT_PROFILE,
        ...source
    };

    profile.skills =
        Array.isArray(source.skills)
            ? [...source.skills]
            : [];

    profile.experience =
        Array.isArray(source.experience)
            ? [...source.experience]
            : [];

    profile.certifications =
        Array.isArray(source.certifications)
            ? [...source.certifications]
            : [];

    profile.courses =
        Array.isArray(source.courses)
            ? [...source.courses]
            : [];

    profile.progress = {
        ...DEFAULT_PROFILE.progress,
        ...(source.progress || {})
    };

    profile.contributions = {
        ...DEFAULT_PROFILE.contributions,
        ...(source.contributions || {})
    };

    profile.professionalLinks = {
        ...DEFAULT_PROFILE.professionalLinks,
        ...(source.professionalLinks || {})
    };

    profile.quiz = {
        ...DEFAULT_PROFILE.quiz,
        ...(source.quiz || {})
    };

    profile.registration = {
        ...DEFAULT_PROFILE.registration,
        ...(source.registration || {})
    };

    return profile;
}

let profile = normalizeProfile(
    readStorage(PROFILE_KEY, {})
);

async function getAccountInfo() {
    // First try AlumniForge Settings data
    try {
        const savedSettings =
            localStorage.getItem("alumniForgeSettings");

        if (savedSettings) {
            const settings =
                JSON.parse(savedSettings);

            if (settings.fullName || settings.email) {
                return {
                    name: String(
                        settings.fullName || ""
                    ).trim(),

                    email: String(
                        settings.email || ""
                    ).trim()
                };
            }
        }
    } catch (error) {
        console.warn(
            "Could not read AlumniForge settings:",
            error
        );
    }
    await clerk.load();

    const user = clerk.user;

    if (!user) {
        return {
            name: "",
            email: ""
        };
    }

    const name =
        user.fullName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim();

    const email =
        user.primaryEmailAddress?.emailAddress || "";

    return {
        name: String(name || "").trim(),
        email: String(email || "").trim()
    };
}

function getInitial(name) {
    const cleanName =
        String(name || "").trim();

    return cleanName
        ? cleanName.charAt(0).toUpperCase()
        : "S";
}

async function updateAccountDisplay() {
    const account =
        await getAccountInfo();

    const name =
        account.name || "Name";

    const email =
        account.email || "email";

    if ($("fullName")) {
        $("fullName").value = name;
    }

    if ($("email")) {
        $("email").value = email;
    }

    if ($("navProfileName")) {
        $("navProfileName").textContent = name;
    }

    if ($("navProfileEmail")) {
        $("navProfileEmail").textContent = email;
    }

    if ($("photoInitial")) {
        $("photoInitial").textContent =
            getInitial(name);
    }

    updateNavbarPhoto();
}

function getStoredPhoto() {
    const photo =
        localStorage.getItem(PHOTO_KEY);

    if (
        photo &&
        (
            photo.startsWith("data:image") ||
            photo.startsWith("http://") ||
            photo.startsWith("https://") ||
            photo.startsWith("blob:")
        )
    ) {
        return photo;
    }

    return "";
}


function updateNavbarPhoto() {
    const avatar =
        $("navbarAvatar");

    if (!avatar) {
        return;
    }

    const photo =
        getStoredPhoto();

    avatar.innerHTML = "";

    if (photo) {
        avatar.classList.add("has-photo");

        const img =
            document.createElement("img");

        img.src = photo;
        img.alt = "Profile photo";

        avatar.appendChild(img);
    } else {
        avatar.classList.remove("has-photo");
    }
}

async function handleLogout(event) {
    event.preventDefault();

    try {
        await clerk.load();

        await clerk.signOut();

        window.location.href = "login.html";

    } catch (error) {
        console.error("Logout failed:", error);

        showToast(
            "Logout failed. Please try again."
        );
    }
}

function updateProfilePhoto() {
    const image =
        $("profilePhoto");

    const initial =
        $("photoInitial");

    if (!image || !initial) {
        return;
    }

    const photo =
        getStoredPhoto();

    if (photo) {
        image.src = photo;
        image.style.display = "block";
        initial.style.display = "none";
    } else {
        image.removeAttribute("src");
        image.style.display = "none";
        initial.style.display = "block";
    }
}
function setValue(id, value) {
    const element = $(id);

    if (!element) {
        return;
    }

    element.value =
        value === null ||
        value === undefined
            ? ""
            : value;
}
function getValue(id) {
    const element = $(id);

    if (!element) {
        return "";
    }

    return String(
        element.value || ""
    ).trim();
}
function getNumber(id) {
    const value =
        Number(getValue(id));

    return Number.isFinite(value)
        ? value
        : 0;
}
async function loadFormData() {
    setValue(
        "aboutMe",
        profile.aboutMe
    );

    setValue(
        "college",
        profile.college
    );

    setValue(
        "phone",
        profile.phone
    );

    setValue(
        "location",
        profile.location
    );

    setValue(
        "dateOfBirth",
        profile.dateOfBirth
    );

    setValue(
        "gender",
        profile.gender
    );

    setValue(
        "degree",
        profile.degree
    );

    setValue(
        "educationCollege",
        profile.educationCollege
    );

    setValue(
        "branch",
        profile.branch
    );

    setValue(
        "startYear",
        profile.startYear
    );

    setValue(
        "endYear",
        profile.endYear
    );

    setValue(
        "coursesCompleted",
        profile.progress.coursesCompleted
    );

    setValue(
        "coursesInProgress",
        profile.progress.coursesInProgress
    );

    setValue(
        "learningInterests",
        profile.progress.learningInterests
    );

    setValue(
        "linkedin",
        profile.professionalLinks.linkedin
    );

    setValue(
        "github",
        profile.professionalLinks.github
    );

    setValue(
        "portfolio",
        profile.professionalLinks.portfolio
    );

    setValue(
        "quizzesAttempted",
        profile.quiz.attempted
    );

    setValue(
        "quizzesCompleted",
        profile.quiz.completed
    );

    setValue(
        "averageScore",
        profile.quiz.averageScore
    );

    setValue(
        "profileVisibility",
        profile.visibility
    );

    setValue(
        "regCollegeEmail",
        profile.registration.collegeEmail
    );

    setValue(
        "regDateOfBirth",
        profile.registration.dateOfBirth
    );

    setValue(
        "regGraduationYear",
        profile.registration.graduationYear
    );

    setValue(
        "regBranch",
        profile.registration.branch
    );

    loadSkills();
    renderExperience();
    renderCertifications();
    renderCourses();

    updateResumeName();
    updateContributions();

    await updateAccountDisplay();

    updateProfilePhoto();
    updateRegistrationSection();
}



function updateRegistrationSection() {
    const section =
        $("registrationInfoSection");

    if (!section) {
        return;
    }

    const registration =
        profile.registration || {};

    const hasRegistrationInfo =
        Boolean(
            registration.collegeEmail ||
            registration.dateOfBirth ||
            registration.graduationYear ||
            registration.branch
        );

    section.hidden =
        !hasRegistrationInfo;
}
function getBuiltInSkills() {
    return Array.from(
        document.querySelectorAll(
            "#skillOptions input[type='checkbox']"
        )
    ).map(
        checkbox => checkbox.value
    );
}

function isBuiltInSkill(skill) {
    return getBuiltInSkills()
        .includes(skill);
}


function getCheckedSkills() {
    return Array.from(
        document.querySelectorAll(
            "#skillOptions input[type='checkbox']:checked"
        )
    ).map(
        checkbox => checkbox.value
    );
}


function getCurrentSkillsForDisplay() {
    const checked =
        getCheckedSkills();

    const custom =
        profile.skills.filter(
            skill =>
                !isBuiltInSkill(skill)
        );

    return [
        ...checked,
        ...custom
    ].filter(
        (skill, index, array) =>
            array.indexOf(skill) === index
    );
}


function loadSkills() {
    const selectedSkills =
        profile.skills || [];

    document
        .querySelectorAll(
            "#skillOptions input[type='checkbox']"
        )
        .forEach(checkbox => {
            checkbox.checked =
                selectedSkills.includes(
                    checkbox.value
                );
        });

    renderSelectedSkills();
}


function renderSelectedSkills() {
    const container =
        $("selectedSkills");

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const skills =
        getCurrentSkillsForDisplay();

    skills.forEach(skill => {
        const tag =
            document.createElement("span");

        tag.className =
            "skill-tag";

        const text =
            document.createElement("span");

        text.textContent =
            skill;

        const remove =
            document.createElement("button");

        remove.type = "button";
        remove.textContent = "×";
        remove.title =
            `Remove ${skill}`;

        remove.addEventListener(
            "click",
            () => removeSkill(skill)
        );

        tag.appendChild(text);
        tag.appendChild(remove);

        container.appendChild(tag);
    });
}


function addCustomSkill() {
    const input =
        $("customSkill");

    if (!input) {
        return;
    }

    const skill =
        input.value.trim();

    if (!skill) {
        showToast(
            "Please enter a skill first."
        );

        input.focus();
        return;
    }

    const existing =
        getCurrentSkillsForDisplay();

    const duplicate =
        existing.some(
            item =>
                item.toLowerCase() ===
                skill.toLowerCase()
        );

    if (duplicate) {
        showToast(
            "That skill is already selected."
        );

        input.select();
        return;
    }

    profile.skills.push(skill);

    input.value = "";

    renderSelectedSkills();

    showToast(
        "Skill added. Click Save Skills to keep it."
    );
}


function removeSkill(skill) {
    profile.skills =
        profile.skills.filter(
            item =>
                item.toLowerCase() !==
                skill.toLowerCase()
        );

    const checkbox =
        Array.from(
            document.querySelectorAll(
                "#skillOptions input[type='checkbox']"
            )
        ).find(
            input =>
                input.value === skill
        );

    if (checkbox) {
        checkbox.checked = false;
    }

    renderSelectedSkills();

    showToast(
        "Skill removed. Save Skills to confirm."
    );
}
function addExperience() {
    const role =
        getValue("experienceRole");

    const organization =
        getValue("experienceOrganization");

    const duration =
        getValue("experienceDuration");

    const description =
        getValue("experienceDescription");

    if (!role || !organization) {
        showToast(
            "Please enter the role and organization."
        );

        return;
    }

    profile.experience.push({
        id: Date.now(),
        role,
        organization,
        duration,
        description
    });

    setValue(
        "experienceRole",
        ""
    );

    setValue(
        "experienceOrganization",
        ""
    );

    setValue(
        "experienceDuration",
        ""
    );

    setValue(
        "experienceDescription",
        ""
    );

    renderExperience();

    showToast(
        "Experience added. Click Save Experience."
    );
}


function renderExperience() {
    const list =
        $("experienceList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    profile.experience.forEach(
        (item, index) => {
            const wrapper =
                createItemElement({
                    title: item.role,

                    meta: [
                        item.organization,
                        item.duration
                    ]
                        .filter(Boolean)
                        .join(" • "),

                    description:
                        item.description,

                    onRemove: () => {
                        profile.experience
                            .splice(index, 1);

                        renderExperience();

                        showToast(
                            "Experience removed."
                        );
                    }
                });

            list.appendChild(wrapper);
        }
    );
}
function addCertification() {
    const name =
        getValue("certificateName");

    const issuer =
        getValue("certificateIssuer");

    const year =
        getValue("certificateYear");

    if (!name || !issuer) {
        showToast(
            "Please enter certificate name and issuer."
        );

        return;
    }

    profile.certifications.push({
        id: Date.now(),
        name,
        issuer,
        year
    });

    setValue(
        "certificateName",
        ""
    );

    setValue(
        "certificateIssuer",
        ""
    );

    setValue(
        "certificateYear",
        ""
    );

    renderCertifications();

    showToast(
        "Certification added. Click Save Certifications."
    );
}
function renderCertifications() {
    const list =
        $("certificateList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    profile.certifications.forEach(
        (item, index) => {
            const wrapper =
                createItemElement({
                    title: item.name,

                    meta: [
                        item.issuer,
                        item.year
                    ]
                        .filter(Boolean)
                        .join(" • "),

                    onRemove: () => {
                        profile.certifications
                            .splice(index, 1);

                        renderCertifications();

                        showToast(
                            "Certification removed."
                        );
                    }
                });

            list.appendChild(wrapper);
        }
    );
}
function addCourse() {
    const name =
        getValue("courseName");

    const status =
        getValue("courseStatus") ||
        "Enrolled";

    if (!name) {
        showToast(
            "Please select a course."
        );

        return;
    }

    const alreadyAdded =
        profile.courses.some(
            course =>
                course.name === name
        );

    if (alreadyAdded) {
        showToast(
            "This course is already added."
        );

        return;
    }

    profile.courses.push({
        id: Date.now(),
        name,
        status
    });

    setValue(
        "courseName",
        ""
    );

    setValue(
        "courseStatus",
        "Enrolled"
    );

    renderCourses();

    showToast(
        "Course added. Click Save Courses."
    );
}


function renderCourses() {
    const list =
        $("courseList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    profile.courses.forEach(
        (item, index) => {
            const wrapper =
                createItemElement({
                    title: item.name,
                    meta: item.status,

                    onRemove: () => {
                        profile.courses
                            .splice(index, 1);

                        renderCourses();

                        showToast(
                            "Course removed."
                        );
                    }
                });

            list.appendChild(wrapper);
        }
    );
}

function createItemElement({
    title,
    meta,
    description,
    onRemove
}) {
    const item =
        document.createElement("div");

    item.className = "item";

    const content =
        document.createElement("div");

    content.className =
        "item-content";

    const titleElement =
        document.createElement("strong");

    titleElement.className =
        "item-title";

    titleElement.textContent =
        title || "";

    content.appendChild(
        titleElement
    );

    if (meta) {
        const metaElement =
            document.createElement("span");

        metaElement.className =
            "item-meta";

        metaElement.textContent =
            meta;

        content.appendChild(
            metaElement
        );
    }

    if (description) {
        const descriptionElement =
            document.createElement("p");

        descriptionElement.className =
            "item-description";

        descriptionElement.textContent =
            description;

        content.appendChild(
            descriptionElement
        );
    }

    const removeButton =
        document.createElement("button");

    removeButton.type = "button";
    removeButton.className =
        "item-remove";

    removeButton.textContent = "×";
    removeButton.title = "Remove";

    removeButton.addEventListener(
        "click",
        onRemove
    );

    item.appendChild(content);
    item.appendChild(removeButton);

    return item;
}

function handleResumeChange(event) {
    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    profile.resumeName =
        file.name;

    updateResumeName();

    showToast(
        "Resume selected. Click Save Resume."
    );
}


function updateResumeName() {
    const element =
        $("resumeName");

    if (!element) {
        return;
    }

    element.textContent =
        profile.resumeName ||
        "No resume selected";
}


function removeResume() {
    profile.resumeName = "";

    if ($("resumeInput")) {
        $("resumeInput").value = "";
    }

    updateResumeName();

    showToast(
        "Resume removed. Click Save Resume."
    );
}

function collectAllFromForm() {
    profile.aboutMe =
        getValue("aboutMe");

    profile.college =
        getValue("college");

    profile.phone =
        getValue("phone");

    profile.location =
        getValue("location");

    profile.dateOfBirth =
        getValue("dateOfBirth");

    profile.gender =
        getValue("gender");

    profile.degree =
        getValue("degree");

    profile.educationCollege =
        getValue("educationCollege");

    profile.branch =
        getValue("branch");

    profile.startYear =
        getValue("startYear");

    profile.endYear =
        getValue("endYear");

    profile.skills =
        getCurrentSkillsForDisplay();

    profile.progress = {
        coursesCompleted:
            getNumber("coursesCompleted"),

        coursesInProgress:
            getNumber("coursesInProgress"),

        learningInterests:
            getValue("learningInterests")
    };

    profile.professionalLinks = {
        linkedin:
            getValue("linkedin"),

        github:
            getValue("github"),

        portfolio:
            getValue("portfolio")
    };

    profile.quiz = {
        attempted:
            getNumber("quizzesAttempted"),

        completed:
            getNumber("quizzesCompleted"),

        averageScore:
            Math.min(
                100,
                Math.max(
                    0,
                    getNumber("averageScore")
                )
            )
    };

    profile.visibility =
        getValue("profileVisibility") ||
        "public";

    return profile;
}


function saveSection(section) {
    switch (section) {

        case "about":
            profile.aboutMe =
                getValue("aboutMe");
            break;

        case "personal":
            profile.college =
                getValue("college");

            profile.phone =
                getValue("phone");

            profile.location =
                getValue("location");

            profile.dateOfBirth =
                getValue("dateOfBirth");

            profile.gender =
                getValue("gender");
            break;

        case "education":
            profile.degree =
                getValue("degree");

            profile.educationCollege =
                getValue("educationCollege");

            profile.branch =
                getValue("branch");

            profile.startYear =
                getValue("startYear");

            profile.endYear =
                getValue("endYear");
            break;

        case "skills":
            profile.skills =
                getCurrentSkillsForDisplay();
            break;

        case "resume":
        case "experience":
        case "certifications":
        case "courses":
            break;

        case "progress":
            profile.progress = {
                coursesCompleted:
                    getNumber("coursesCompleted"),

                coursesInProgress:
                    getNumber("coursesInProgress"),

                learningInterests:
                    getValue("learningInterests")
            };
            break;

        case "links":
            profile.professionalLinks = {
                linkedin:
                    getValue("linkedin"),

                github:
                    getValue("github"),

                portfolio:
                    getValue("portfolio")
            };
            break;

        case "quiz":
            profile.quiz = {
                attempted:
                    getNumber("quizzesAttempted"),

                completed:
                    getNumber("quizzesCompleted"),

                averageScore:
                    Math.min(
                        100,
                        Math.max(
                            0,
                            getNumber("averageScore")
                        )
                    )
            };
            break;

        case "visibility":
            profile.visibility =
                getValue("profileVisibility") ||
                "public";
            break;

        default:
            console.warn(
                "Unknown profile section:",
                section
            );

            return;
    }

    if (
        writeStorage(
            PROFILE_KEY,
            profile
        )
    ) {
        showToast(
            `${getSectionName(section)} saved successfully.`
        );
    }
}


function getSectionName(section) {
    const names = {
        about: "About",
        personal: "Personal information",
        education: "Education",
        skills: "Skills",
        resume: "Resume",
        experience: "Experience",
        certifications: "Certifications",
        courses: "Courses",
        progress: "Learning progress",
        links: "Professional links",
        quiz: "Quiz record",
        visibility: "Profile visibility"
    };

    return names[section] || "Profile";
}




function saveAllProfile() {
    collectAllFromForm();

    if (
        writeStorage(
            PROFILE_KEY,
            profile
        )
    ) {
        showToast(
            "All profile changes saved successfully."
        );
    }
}



async function resetProfile() {
    const confirmed =
        window.confirm(
            "Reset the form to your last saved profile?"
        );

    if (!confirmed) {
        return;
    }

    profile =
        normalizeProfile(
            readStorage(
                PROFILE_KEY,
                {}
            )
        );

    await loadFormData();

    showToast(
        "Profile reset to the last saved version."
    );
}




function updateContributions() {
    const contributions =
        profile.contributions || {};

    if ($("contributionPosts")) {
        $("contributionPosts").textContent =
            Number(contributions.posts) || 0;
    }

    if ($("contributionComments")) {
        $("contributionComments").textContent =
            Number(contributions.comments) || 0;
    }

    if ($("contributionResources")) {
        $("contributionResources").textContent =
            Number(contributions.resources) || 0;
    }
}
let toastTimer = null;

function showToast(message) {
    const toast =
        $("profileToast");

    if (!toast) {
        return;
    }

    toast.textContent =
        message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(() => {
            toast.classList.remove("show");
        }, 2600);
}
function setupProfileDropdown() {
    const wrapper =
        document.querySelector(
            ".profile-wrapper"
        );

    const button =
        $("profileButton");

    if (!wrapper || !button) {
        return;
    }

    button.addEventListener(
        "click",
        event => {
            event.stopPropagation();

            wrapper.classList.toggle(
                "open"
            );

            const isOpen =
                wrapper.classList.contains(
                    "open"
                );

            button.setAttribute(
                "aria-expanded",
                isOpen
                    ? "true"
                    : "false"
            );
        }
    );

    document.addEventListener(
        "click",
        event => {
            if (
                !wrapper.contains(
                    event.target
                )
            ) {
                wrapper.classList.remove(
                    "open"
                );

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        }
    );

    document.addEventListener(
        "keydown",
        event => {
            if (event.key === "Escape") {
                wrapper.classList.remove(
                    "open"
                );

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );

                button.focus();
            }
        }
    );
}
function applyTheme() {
    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        ) || "light";

    const prefersDark =
        window.matchMedia &&
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

    const shouldUseDark =
        savedTheme === "dark" ||
        (
            savedTheme === "system" &&
            prefersDark
        );

    document.documentElement.classList.toggle(
        "dark",
        shouldUseDark
    );
}
function setupThemeSync() {
    window.addEventListener(
        "storage",
        event => {

            if (event.key === THEME_KEY) {
                applyTheme();
            }

            if (event.key === PHOTO_KEY) {
                updateProfilePhoto();
                updateNavbarPhoto();
            }

            if (event.key === PROFILE_KEY) {
                profile =
                    normalizeProfile(
                        readStorage(
                            PROFILE_KEY,
                            {}
                        )
                    );

                loadFormData();
            }
        }
    );

    const mediaQuery =
        window.matchMedia
            ? window.matchMedia(
                "(prefers-color-scheme: dark)"
            )
            : null;

    if (!mediaQuery) {
        return;
    }

    const handleSystemTheme =
        () => {
            const savedTheme =
                localStorage.getItem(
                    THEME_KEY
                ) || "light";

            if (
                savedTheme === "system"
            ) {
                applyTheme();
            }
        };

    if (
        mediaQuery.addEventListener
    ) {
        mediaQuery.addEventListener(
            "change",
            handleSystemTheme
        );
    } else if (
        mediaQuery.addListener
    ) {
        mediaQuery.addListener(
            "change",
            handleSystemTheme
        );
    }
}
function setupEvents() {
    $("logoutLink")?.addEventListener(
    "click",
    handleLogout
);
    document
        .querySelectorAll(
            ".section-save-btn"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    saveSection(
                        button.dataset.section
                    );
                }
            );
        });


    $("saveProfileBtn")?.addEventListener(
        "click",
        saveAllProfile
    );


    $("resetProfileBtn")?.addEventListener(
        "click",
        resetProfile
    );


    $("addSkillBtn")?.addEventListener(
        "click",
        addCustomSkill
    );


    $("customSkill")?.addEventListener(
        "keydown",
        event => {
            if (event.key === "Enter") {
                event.preventDefault();
                addCustomSkill();
            }
        }
    );


    document
        .querySelectorAll(
            "#skillOptions input[type='checkbox']"
        )
        .forEach(checkbox => {
            checkbox.addEventListener(
                "change",
                renderSelectedSkills
            );
        });


    $("resumeInput")?.addEventListener(
        "change",
        handleResumeChange
    );


    $("removeResumeBtn")?.addEventListener(
        "click",
        removeResume
    );


    $("addExperienceBtn")?.addEventListener(
        "click",
        addExperience
    );


    $("addCertificateBtn")?.addEventListener(
        "click",
        addCertification
    );


    $("addCourseBtn")?.addEventListener(
        "click",
        addCourse
    );
}
async function init() {
    applyTheme();

    setupProfileDropdown();
    setupThemeSync();
    setupEvents();

    await loadFormData();
}
if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        init
    );
} else {
    init();
}
