document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const googleLoginBtn = document.getElementById("google-login-btn");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;

    // Validate input fields
    if (!email || !password) {
      Swal.fire({
        title: "Login Failed",
        text: "Email and password are required.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();
      // Use SweetAlert for success notification
      Swal.fire({
        title: "Login Successful!",
        text: `Welcome back!`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        localStorage.setItem("jwtToken", data.token); // Save token
        localStorage.setItem("userId", data.user.id); // Save user ID

        // Check user role and redirect accordingly
        if (data.user.role === "admin") {
          window.location.href =
            "https://jumatberkah.vercel.app/admin/admin.html"; // Redirect to admin dashboard
        } else {
          window.location.href = "https://jumatberkah.vercel.app/"; // Redirect to main page
        }
      });
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      // Use SweetAlert for error notification
      Swal.fire({
        title: "Login Failed",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  });

  // Handle Google login callback
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("token")) {
    // Ubah dari 'googleLogin' ke 'token'
    const token = urlParams.get("token");

    if (token) {
      // Decode token untuk mendapatkan informasi user
      const tokenParts = token.split(".");
      const payload = JSON.parse(atob(tokenParts[1]));

      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userId", payload.user_id); // Ambil user_id dari token

      Swal.fire({
        title: "Login Successful!",
        text: "Welcome back!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        // Cek role dari payload token
        if (payload.role === "admin") {
          window.location.href =
            "https://jumatberkah.vercel.app/admin/admin.html";
        } else {
          window.location.href = "https://jumatberkah.vercel.app/";
        }
      });
    }
  }
  // Registration functionality
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    const name = document.getElementById("name-input").value;
    const email = document.getElementById("signup-email-input").value;
    const password = document.getElementById("signup-password-input").value;

    // Validate input fields
    if (!name || !email || !password) {
      Swal.fire({
        title: "Registration Failed",
        text: "All fields are required.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Registration failed");
      }

      const data = await response.json();
      // Use SweetAlert for success notification
      Swal.fire({
        title: "Registration Successful!",
        text: `Welcome, ${data.user.name}! You can now log in.`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        // Optionally redirect to login page or clear the form
        window.location.href = "login.html"; // Redirect to login page
      });
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      // Use SweetAlert for error notification
      Swal.fire({
        title: "Registration Failed",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  });
});
