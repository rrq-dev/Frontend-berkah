document.addEventListener("DOMContentLoaded", () => {
  const masjidList = document.getElementById("masjid-list");
  const searchBar = document.getElementById("search-bar");
  const searchButton = document.getElementById("search-button");
  const errorMessage = document.getElementById("error-message");
  const detailsContainer = document.getElementById("masjid-details");

  // Cek apakah pengguna sudah login
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    window.location.href =
      "https://rrq-dev.github.io/jumatberkah.github.io/auth/login.html"; // Redirect ke halaman login jika belum login
  }

  // Fungsi untuk mengambil semua lokasi masjid
  async function fetchMasjidData(searchTerm = "") {
    try {
      const response = await fetch(
        "https://backend-berkah.onrender.com/getlocation",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Sertakan token di header
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        window.location.href =
          "https://rrq-dev.github.io/jumatberkah.github.io/auth/login.html";
        return;
      }

      if (!response.ok) {
        const errorMessage = await response.text(); // Ambil pesan error dari respons
        throw new Error(`Error: ${errorMessage}`);
      }

      const masjidData = await response.json(); // Parse JSON dari respons
      displayMasjidList(masjidData, searchTerm); // Tampilkan daftar masjid
    } catch (error) {
      console.error("Error fetching masjid data:", error);
      errorMessage.innerText = "Error loading masjid data.";
      errorMessage.style.display = "block";
    }
  }

  // Fungsi untuk menampilkan daftar masjid
  function displayMasjidList(masjidData, searchTerm = "") {
    masjidList.innerHTML = ""; // Kosongkan daftar sebelum menambahkan yang baru

    const filteredData = masjidData.filter((masjid) =>
      masjid.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filteredData.forEach((masjid) => {
      const masjidItem = document.createElement("div");
      masjidItem.className = "masjid-item";
      masjidItem.innerHTML = `        
              <h3>${masjid.name}</h3>        
              <p>${masjid.address}</p>        
              <p>${masjid.description}</p>        
              <button class="view-details" data-id="${masjid.id}">View Details</button>        
          `;
      masjidList.appendChild(masjidItem);

      // Event listener untuk hover pada masjidItem
      masjidItem.addEventListener("mouseover", () => {
        masjidItem.style.backgroundColor = getRandomColor(); // Mengubah warna latar belakang saat hover
      });

      masjidItem.addEventListener("mouseout", () => {
        masjidItem.style.backgroundColor = ""; // Mengembalikan warna latar belakang saat mouse keluar
      });
    });

    // Menambahkan event listener untuk tombol View Details
    const viewDetailsButtons = document.querySelectorAll(".view-details");
    viewDetailsButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const masjidId = button.getAttribute("data-id");
        fetchMasjidById(masjidId);
      });
    });
  }

  // Fungsi untuk mengambil lokasi masjid berdasarkan ID
  async function fetchMasjidById(masjidId) {
    try {
      const response = await fetch(
        `https://backend-berkah.onrender.com/getlocation?id=${masjidId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Sertakan token di header
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        window.location.href =
          "https://rrq-dev.github.io/jumatberkah.github.io/auth/login.html";
        return;
      }

      if (!response.ok) {
        const errorMessage = await response.text(); // Ambil pesan error dari respons
        throw new Error(`Error: ${errorMessage}`);
      }

      const masjidDetails = await response.json(); // Parse JSON dari respons
      displayMasjidDetails(masjidDetails); // Tampilkan detail masjid
    } catch (error) {
      console.error("Error fetching masjid details:", error);
      errorMessage.innerText = "Error loading masjid details.";
      errorMessage.style.display = "block";
    }
  }

  // Fungsi untuk menampilkan detail masjid
  function displayMasjidDetails(masjid) {
    detailsContainer.innerHTML = `        
          <h2>${masjid.name}</h2>        
          <p>Address: ${masjid.address}</p>        
          <p>Description: ${masjid.description}</p>        
          <div class="rating">  
            <span>Rate this masjid:</span>  
            <div class="stars" data-id="${masjid.id}">  
              ${[1, 2, 3, 4, 5]
                .map(
                  (star) => `<span class="star" data-value="${star}">★</span>`
                )
                .join("")}  
            </div>  
            <textarea placeholder="Leave a comment..." class="comment"></textarea>  
            <button class="submit-feedback">Submit Feedback</button>  
            <div class="feedback-list"></div>  
          </div>  
      `;
    detailsContainer.style.display = "block"; // Tampilkan detail

    // Add event listeners for stars and feedback submission
    const stars = detailsContainer.querySelectorAll(".star");
    stars.forEach((star) => {
      star.addEventListener("click", () => {
        const rating = star.getAttribute("data-value");
        const comment = detailsContainer.querySelector(".comment").value;
        submitFeedback(masjid.id, rating, comment);
      });
    });
  }

  // Function to submit feedback
  async function submitFeedback(masjidId, rating, comment) {
    // Here you would typically send the feedback to your backend
    const feedbackList = document.querySelector(".feedback-list");
    const feedbackItem = document.createElement("div");
    feedbackItem.innerHTML = `  
      <p>Rating: ${rating} - Comment: ${comment}</p>  
      <button class="edit-feedback">Edit</button>  
      <button class="delete-feedback">Delete</button>  
    `;
    feedbackList.appendChild(feedbackItem);

    // Add edit and delete functionality
    feedbackItem
      .querySelector(".edit-feedback")
      .addEventListener("click", () => {
        const newComment = prompt("Edit your comment:", comment);
        if (newComment) {
          feedbackItem.querySelector(
            "p"
          ).innerHTML = `Rating: ${rating} - Comment: ${newComment}`;
        }
      });

    feedbackItem
      .querySelector(".delete-feedback")
      .addEventListener("click", () => {
        feedbackList.removeChild(feedbackItem);
      });
  }

  // Event listener untuk tombol pencarian
  searchButton.addEventListener("click", () => {
    const searchTerm = searchBar.value;
    fetchMasjidData(searchTerm);
  });

  // Event listener untuk hover pada navbar links
  const navLinks = document.querySelectorAll(".navbar .nav-links a");

  navLinks.forEach((link) => {
    link.addEventListener("mouseover", () => {
      link.style.backgroundColor = getRandomColor(); // Mengubah warna latar belakang saat hover
    });

    link.addEventListener("mouseout", () => {
      link.style.backgroundColor = ""; // Mengembalikan warna latar belakang saat mouse keluar
    });
  });

  // Event listener untuk hover pada auth links
  const authLinks = document.querySelectorAll(".auth-links a");

  authLinks.forEach((link) => {
    link.addEventListener("mouseover", () => {
      link.style.backgroundColor = getRandomColor(); // Mengubah warna latar belakang saat hover
    });

    link.addEventListener("mouseout", () => {
      link.style.backgroundColor = ""; // Mengembalikan warna latar belakang saat mouse keluar
    });
  });

  // Fungsi untuk menghasilkan warna acak
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Fungsi untuk logout
  function logout() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    alert("Logout successful!");
    window.location.href = "https://rrq-dev.github.io/jumatberkah.github.io"; // Redirect ke halaman utama
  }

  // Menangani tampilan tombol logout jika pengguna sudah login
  function updateAuthLinks() {
    const logoutBtn = document.getElementById("logout-btn");
    if (localStorage.getItem("jwtToken")) {
      logoutBtn.innerText = "Logout";
      logoutBtn.onclick = logout; // Set fungsi logout
    } else {
      logoutBtn.innerText = "Sign in";
      logoutBtn.href = "auth/login.html"; // Redirect ke halaman login
    }
  }

  // Inisialisasi
  window.onload = function () {
    updateAuthLinks(); // Perbarui tampilan tombol login/logout
    fetchMasjidData(); // Ambil semua masjid saat halaman dimuat
  };
});
