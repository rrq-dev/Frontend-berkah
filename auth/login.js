document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const googleLoginBtn = document.getElementById("google-login-btn");
  const forgotPasswordLink = document.getElementById("forgot-password-link");
  const signUpBtn = document.getElementById("sign-up-btn");
  const signInBtn = document.getElementById("sign-in-btn");
  const loginBox = document.querySelector(".login-box");

  // Handle error dari URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  const errorDescription = urlParams.get("error_description");

  if (error) {
    console.error("Login error:", error, errorDescription); // Untuk debugging
    let errorMessage = "Kode otorisasi tidak ditemukan";

    switch (error) {
      case "no_code":
        errorMessage = "Kode otorisasi tidak ditemukan";
        break;
      case "invalid_state":
        errorMessage = "Sesi login tidak valid, silakan coba lagi";
        break;
      case "unauthorized":
        errorMessage = "Akses tidak diizinkan";
        break;
      default:
        errorMessage = errorDescription || "Terjadi kesalahan saat login";
    }

    // Tampilkan error dengan SweetAlert2
    Swal.fire({
      title: "Login Gagal",
      text: errorMessage,
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#2e7d32",
    }).then(() => {
      // Bersihkan URL dari parameter error
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    });
  }

  // Handle Google login
  googleLoginBtn.addEventListener("click", async () => {
    try {
      // Tampilkan loading
      Swal.fire({
        title: "Menghubungkan...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Redirect ke endpoint Auth0
      const loginUrl = "https://backend-berkah.onrender.com/auth/google/login";
      console.log("Redirecting to:", loginUrl); // Untuk debugging

      // Tambahkan state untuk keamanan
      const state = generateRandomString(32);
      sessionStorage.setItem("auth_state", state);

      // Redirect dengan state
      window.location.href = `${loginUrl}?state=${state}`;
    } catch (error) {
      console.error("Error initiating login:", error);
      Swal.fire({
        title: "Error",
        text: "Gagal memulai proses login. Silakan coba lagi.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#2e7d32",
      });
    }
  });

  // Handle login form biasa
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email-input").value.trim();
    const password = document.getElementById("password-input").value;

    if (!email || !password) {
      Swal.fire({
        title: "Login Gagal",
        text: "Email dan password harus diisi.",
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#2e7d32",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Memproses...",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await fetch(
        "https://backend-berkah.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Username atau password salah");
      }

      // Simpan data ke localStorage
      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userRole", data.user.role);

      await Swal.fire({
        title: "Login Berhasil!",
        text: "Selamat datang kembali!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        timerProgressBar: true,
      });

      // Redirect berdasarkan role
      const redirectUrl =
        data.user.role === "admin"
          ? "https://jumatberkah.vercel.app/admin/admin.html"
          : "https://jumatberkah.vercel.app/";

      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Error during login:", error);
      Swal.fire({
        title: "Login Gagal",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
        confirmButtonColor: "#2e7d32",
      });
    }
  });

  // Handle forgot password
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "reset-password/reset-password.html";
  });

  // Handle reset password token jika ada
  const resetToken = urlParams.get("resetToken");
  if (resetToken) {
    // Handle reset password
    Swal.fire({
      title: "Update Password Baru",
      html: `
        <input type="password" id="new-password" class="swal2-input" placeholder="Password baru">
        <input type="password" id="confirm-password" class="swal2-input" placeholder="Konfirmasi password">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update Password",
      cancelButtonText: "Batal",
      confirmButtonColor: "#2e7d32",
      cancelButtonColor: "#dc3545",
      preConfirm: () => {
        const newPassword = document.getElementById("new-password").value;
        const confirmPassword =
          document.getElementById("confirm-password").value;

        if (!newPassword || !confirmPassword) {
          Swal.showValidationMessage("Semua field harus diisi");
          return false;
        }

        if (newPassword.length < 6) {
          Swal.showValidationMessage("Password minimal 6 karakter");
          return false;
        }

        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage("Password tidak cocok");
          return false;
        }

        return { newPassword };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            "https://backend-berkah.onrender.com/update-password",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                token: resetToken,
                new_password: result.value.newPassword,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Gagal update password");
          }

          await Swal.fire({
            title: "Berhasil!",
            text: "Password berhasil diperbarui",
            icon: "success",
            confirmButtonText: "OK",
            confirmButtonColor: "#2e7d32",
          });

          window.location.href = "login.html";
        } catch (error) {
          console.error("Error updating password:", error);
          Swal.fire({
            title: "Gagal",
            text: error.message || "Gagal memperbarui password",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#2e7d32",
          });
        }
      }
    });
  }

  // Handle successful login (callback dari Auth0)
  const token = urlParams.get("token");
  if (token) {
    // Simpan token
    localStorage.setItem("jwtToken", token);

    // Redirect ke halaman yang sesuai
    const userRole = parseJwt(token).role;
    const redirectUrl =
      userRole === "admin"
        ? "https://jumatberkah.vercel.app/admin/admin.html"
        : "https://jumatberkah.vercel.app/";

    window.location.href = redirectUrl;
  }

  signUpBtn.addEventListener("click", () => {
    loginBox.classList.add("sign-up-mode");
  });

  signInBtn.addEventListener("click", () => {
    loginBox.classList.remove("sign-up-mode");
  });
});

// Helper function untuk generate random string
function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Helper function untuk parse JWT
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error parsing JWT:", error);
    return {};
  }
}

// Update tampilan loading
function showLoading() {
  const loadingDiv = document.createElement("div");
  loadingDiv.id = "loading-overlay";
  loadingDiv.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Menghubungkan ke Google...</p>
  `;
  document.body.appendChild(loadingDiv);
}

function hideLoading() {
  const loadingDiv = document.getElementById("loading-overlay");
  if (loadingDiv) {
    loadingDiv.remove();
  }
}
