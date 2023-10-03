document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const errorMessage = document.getElementById("error-message");


    // Hardcoded multiple users
    const validUsers = [{
            username: "aquint",
            password: "pgio9s"
        },
        {
            username: "jbindi",
            password: "nunu69"
        },
        {
            username: "pblang",
            password: "tulie"
        },
        {
            username: "marvizu",
            password: "6recvl"
        },
        {
            username: "tjorda",
            password: "kaga4l"
        },
        {
            username: "pbaga",
            password: "0s3kr1"
        },
        {
            username: "adelli",
            password: "eiddyc"
        },
        {
            username: "jbaga",
            password: "t9za3u"
        },
        {
            username: "bleet",
            password: "3o59ad"
        },
        {
            username: "dbouch",
            password: "franklin"
        },
        {
            username: "cgodi",
            password: "z4h7w2"
        },
        {
            username: "dhari",
            password: "4rs3fd"
        }
    ];

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        const isAuthenticated = validUsers.some(user => user.username === username && user.password === password);

        if (isAuthenticated) {
            localStorage.setItem("loggedInUser", username);
            window.location.href = "../login/username.html";
        } else {
            errorMessage.textContent = "Invalid credentials";
        }
    });
});