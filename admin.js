// Password for admin access
const ADMIN_PASSWORD = "admin123";

// DOM Elements
const authOverlay = document.getElementById("authOverlay");
const adminContent = document.getElementById("adminContent");
const adminPasswordInput = document.getElementById("adminPassword");
const unlockBtn = document.getElementById("unlockBtn");
const authError = document.getElementById("authError");
const logoutBtn = document.getElementById("logoutBtn");

// Admin Data
let hairstyles = [
    { id: "style1", name: "Classic Blowout", price: 79, emoji: "💨" },
    { id: "style2", name: "Balayage + Ombré", price: 189, emoji: "🎨" },
    { id: "style3", name: "Luxury Curls", price: 99, emoji: "🌀" },
    { id: "style4", name: "Sleek Straightening", price: 89, emoji: "📏" },
    { id: "style5", name: "Chic Bob / Pixie", price: 69, emoji: "✂️" }
];

let adminConfig = {
    heroTitle: "GLOSS & GLAM · E-SALON",
    heroSub: "prebook your signature transformation — style, color, magic",
    accentColor: "#d97a4a",
    bgStart: "#fef5f0",
    bgEnd: "#ffe8e0"
};

// Load saved data from localStorage
function loadSavedData() {
    const saved = localStorage.getItem("eSalonAdminFullConfig");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            adminConfig = parsed.adminConfig || adminConfig;
            if (parsed.hairstyles) hairstyles = parsed.hairstyles;
        } catch(e) {}
    }
    
    // Populate form fields
    document.getElementById("heroTitle").value = adminConfig.heroTitle;
    document.getElementById("heroSub").value = adminConfig.heroSub;
    document.getElementById("accentColor").value = adminConfig.accentColor;
    document.getElementById("bgStart").value = adminConfig.bgStart;
    document.getElementById("bgEnd").value = adminConfig.bgEnd;
    
    renderHairstyleList();
}

// Render bookings table
function renderBookingsTable() {
    const tbody = document.getElementById("bookingsTableBody");
    const bookings = JSON.parse(localStorage.getItem("eSalonBookings") || "[]");
    
    if (bookings.length === 0) {
        tbody.innerHTML = "<tr><td colspan='7'>✨ No bookings yet. Customers will appear here.</td></tr>";
        return;
    }
    
    tbody.innerHTML = "";
    bookings.forEach(booking => {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = booking.id.substring(0, 12);
        row.insertCell(1).innerText = booking.customer;
        row.insertCell(2).innerText = booking.email;
        row.insertCell(3).innerText = `${booking.date} ${booking.time}`;
        row.insertCell(4).innerText = booking.styleName;
        row.insertCell(5).innerText = `$${booking.price}`;
        const actionCell = row.insertCell(6);
        const delBtn = document.createElement("button");
        delBtn.innerText = "🗑️ Delete";
        delBtn.className = "delete-btn";
        delBtn.onclick = () => {
            if (confirm(`Delete booking for ${booking.customer}?`)) {
                const updatedBookings = bookings.filter(b => b.id !== booking.id);
                localStorage.setItem("eSalonBookings", JSON.stringify(updatedBookings));
                renderBookingsTable();
                alert("Booking deleted!");
            }
        };
        actionCell.appendChild(delBtn);
    });
}

// Render hairstyle management list
function renderHairstyleList() {
    const container = document.getElementById("hairstyleList");
    if (!container) return;
    container.innerHTML = "";
    
    hairstyles.forEach((style, idx) => {
        const div = document.createElement("div");
        div.className = "style-row";
        div.innerHTML = `
            <input type="text" value="${style.name}" data-idx="${idx}" class="style-name" placeholder="Style Name">
            <input type="number" value="${style.price}" data-idx="${idx}" class="style-price" placeholder="Price" style="width: 100px;">
            <input type="text" value="${style.emoji}" data-idx="${idx}" class="style-emoji" placeholder="Emoji" style="width: 70px;">
            <button class="delete-style" data-idx="${idx}" style="background:#e25c3a; color:white; border:none; padding:5px 15px; border-radius:30px; cursor:pointer;">Remove</button>
        `;
        container.appendChild(div);
    });
    
    // Attach event listeners for live updates
    document.querySelectorAll(".style-name").forEach(inp => {
        inp.addEventListener("change", (e) => {
            const idx = parseInt(e.target.dataset.idx);
            if (hairstyles[idx]) hairstyles[idx].name = e.target.value;
        });
    });
    
    document.querySelectorAll(".style-price").forEach(inp => {
        inp.addEventListener("change", (e) => {
            const idx = parseInt(e.target.dataset.idx);
            if (hairstyles[idx]) hairstyles[idx].price = parseInt(e.target.value) || 0;
        });
    });
    
    document.querySelectorAll(".style-emoji").forEach(inp => {
        inp.addEventListener("change", (e) => {
            const idx = parseInt(e.target.dataset.idx);
            if (hairstyles[idx]) hairstyles[idx].emoji = e.target.value;
        });
    });
    
    document.querySelectorAll(".delete-style").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const idx = parseInt(btn.dataset.idx);
            hairstyles.splice(idx, 1);
            if (hairstyles.length === 0) {
                hairstyles.push({ id: "default", name: "Signature Style", price: 99, emoji: "💇" });
            }
            renderHairstyleList();
        });
    });
}

// Save all settings to localStorage
function saveAllSettings() {
    adminConfig.heroTitle = document.getElementById("heroTitle").value;
    adminConfig.heroSub = document.getElementById("heroSub").value;
    adminConfig.accentColor = document.getElementById("accentColor").value;
    adminConfig.bgStart = document.getElementById("bgStart").value;
    adminConfig.bgEnd = document.getElementById("bgEnd").value;
    
    const fullConfig = {
        adminConfig: adminConfig,
        hairstyles: hairstyles
    };
    
    localStorage.setItem("eSalonAdminFullConfig", JSON.stringify(fullConfig));
    alert("✅ Settings saved successfully! Front page will reflect changes.");
}

// Add new hairstyle
document.getElementById("addHairstyleBtn")?.addEventListener("click", () => {
    hairstyles.push({
        id: "new_" + Date.now(),
        name: "New Style",
        price: 100,
        emoji: "✨"
    });
    renderHairstyleList();
});

// Refresh bookings button
document.getElementById("refreshBookings")?.addEventListener("click", () => {
    renderBookingsTable();
});

// Save settings button
document.getElementById("saveSettingsBtn")?.addEventListener("click", saveAllSettings);

// Authentication logic
function unlockAdmin() {
    const password = adminPasswordInput.value;
    if (password === ADMIN_PASSWORD) {
        authOverlay.style.display = "none";
        adminContent.style.display = "block";
        loadSavedData();
        renderBookingsTable();
    } else {
        authError.innerText = "Wrong password! Access denied.";
    }
}

if (unlockBtn) {
    unlockBtn.addEventListener("click", unlockAdmin);
}

if (adminPasswordInput) {
    adminPasswordInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") unlockAdmin();
    });
}

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        authOverlay.style.display = "flex";
        adminContent.style.display = "none";
        adminPasswordInput.value = "";
        authError.innerText = "";
    });
}
