// Hairstyle Catalog
let hairstyles = [
    { id: "classic_blowout", name: "Classic Blowout", price: 79, emoji: "💨" },
    { id: "baliage_ombre", name: "Balayage + Ombré", price: 189, emoji: "🎨" },
    { id: "luxury_curls", name: "Luxury Curls", price: 99, emoji: "🌀" },
    { id: "sleek_straight", name: "Sleek Straightening", price: 89, emoji: "📏" },
    { id: "bob_cut", name: "Chic Bob / Pixie", price: 69, emoji: "✂️" }
];

let currentStyle = null;
let currentImageSrc = "https://placehold.co/600x400/FFE3D6/9B6A4E?text=Upload+Your+Photo";

// Admin Config (loaded from localStorage if exists)
let adminConfig = {
    heroTitle: "GLOSS & GLAM · E-SALON",
    heroSub: "prebook your signature transformation — style, color, magic",
    accentColor: "#d97a4a",
    bgStart: "#fef5f0",
    bgEnd: "#ffe8e0"
};

// DOM Elements
const styleGrid = document.getElementById("styleGrid");
const dynamicPriceSpan = document.getElementById("dynamicPrice");
const hairImageElem = document.getElementById("hairImage");
const summaryStyleSpan = document.getElementById("summaryStyle");
const summaryPricePreviewSpan = document.getElementById("summaryPricePreview");
const heroTitleDiv = document.getElementById("heroTitle");
const heroSubDiv = document.getElementById("heroSub");

// Load saved admin config from localStorage
function loadAdminConfig() {
    const saved = localStorage.getItem("eSalonAdminFullConfig");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            adminConfig = parsed.adminConfig || adminConfig;
            if (parsed.hairstyles) hairstyles = parsed.hairstyles;
        } catch(e) {}
    }
    updateHeroUI();
    applyGlobalStyles();
    renderStyleButtons();
}

function applyGlobalStyles() {
    document.body.style.background = `linear-gradient(145deg, ${adminConfig.bgStart} 0%, ${adminConfig.bgEnd} 100%)`;
    const activeTags = document.querySelectorAll(".style-tag.active");
    activeTags.forEach(tag => tag.style.background = adminConfig.accentColor);
}

function updateHeroUI() {
    if (heroTitleDiv) heroTitleDiv.innerText = adminConfig.heroTitle;
    if (heroSubDiv) heroSubDiv.innerText = adminConfig.heroSub;
}

function showToast(message, duration = 2000) {
    const toast = document.getElementById("toastMsg");
    toast.innerText = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), duration);
}

function updatePriceAndSummary() {
    if (currentStyle) {
        dynamicPriceSpan.innerText = `$${currentStyle.price}`;
        summaryStyleSpan.innerText = `Style: ${currentStyle.name}`;
        summaryPricePreviewSpan.innerText = `Price: $${currentStyle.price}`;
    } else {
        dynamicPriceSpan.innerText = "$--";
        summaryStyleSpan.innerText = "Style: not selected";
        summaryPricePreviewSpan.innerText = "Price: $--";
    }
}

function renderStyleButtons() {
    if (!styleGrid) return;
    styleGrid.innerHTML = "";
    hairstyles.forEach((style, idx) => {
        const btn = document.createElement("div");
        btn.classList.add("style-tag");
        if (!currentStyle && idx === 0) {
            btn.classList.add("active");
            currentStyle = style;
        } else if (currentStyle && currentStyle.id === style.id) {
            btn.classList.add("active");
        }
        btn.innerHTML = `${style.emoji} ${style.name}  $${style.price}`;
        btn.addEventListener("click", () => {
            currentStyle = style;
            updatePriceAndSummary();
            document.querySelectorAll(".style-tag").forEach(t => t.classList.remove("active"));
            btn.classList.add("active");
            applyGlobalStyles();
            showToast(`Selected: ${style.name} — $${style.price}`);
        });
        styleGrid.appendChild(btn);
    });
    updatePriceAndSummary();
    applyGlobalStyles();
}

function setImage(src) {
    currentImageSrc = src;
    hairImageElem.src = src;
}

// Image Upload Handlers
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("imageUpload");
const sampleBtn = document.getElementById("samplePhotoBtn");

if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => setImage(e.target.result);
            reader.readAsDataURL(file);
            showToast("Photo uploaded! Now choose your hairstyle", 1500);
        }
    });
}

if (sampleBtn) {
    sampleBtn.addEventListener("click", () => {
        setImage("https://images.pexels.com/photos/3998422/pexels-photo-3998422.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop");
        showToast("Sample model loaded — pick your style", 1500);
    });
}

// Booking Form Handler
const bookingForm = document.getElementById("bookingForm");
const prebookDateInput = document.getElementById("prebookDate");

if (prebookDateInput) {
    prebookDateInput.min = new Date().toISOString().split('T')[0];
}

if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const fullname = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const prebookDate = prebookDateInput.value;
        const timeSlot = document.getElementById("timeSlot").value;
        const notes = document.getElementById("notes").value;
        
        if (!fullname || !email || !prebookDate || !timeSlot) {
            showToast("Please fill all required fields", 2000);
            return;
        }
        if (!email.includes("@")) {
            showToast("Please provide a valid email address", 2000);
            return;
        }
        
        const prebookData = {
            id: "BK" + Date.now(),
            customer: fullname,
            email: email,
            phone: phone || "Not provided",
            date: prebookDate,
            time: timeSlot,
            styleName: currentStyle?.name || "Not selected",
            price: currentStyle?.price || 0,
            notes: notes,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        let existingBookings = JSON.parse(localStorage.getItem("eSalonBookings") || "[]");
        existingBookings.push(prebookData);
        localStorage.setItem("eSalonBookings", JSON.stringify(existingBookings));
        
        showToast(`🎉 Prebook confirmed, ${fullname}!`, 3000);
        alert(`✅ Booking Confirmed!\n\nName: ${fullname}\nStyle: ${currentStyle?.name} ($${currentStyle?.price})\nDate: ${prebookDate} at ${timeSlot}\n\nWe'll contact you shortly.`);
        
        // Reset form
        document.getElementById("fullname").value = "";
        document.getElementById("email").value = "";
        document.getElementById("phone").value = "";
        document.getElementById("notes").value = "";
    });
}

// Initialize
loadAdminConfig();
