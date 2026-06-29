/* ============================================================
   ZUSAMMEN TOURS & TRAVEL AGENCY — MAIN SCRIPT
   ============================================================ */

"use strict";

/* ===== DATA ===== */
const TOURS = [
  {
    id: 1,
    title: "Namibia Desert & Etosha Safari",
    location: "Namibia",
    category: "Luxury Safaris",
    rating: 5,
    reviews: 14,
    price: 85000,
    oldPrice: 95000,
    days: 8,
    nights: 7,
    guests: 12,
    minAge: 6,
    img: "assets/gallery/etosha-national-park-namibia-wildlife-safari-at-waterhole.jpg",
    description:
      "Experience the golden dunes of Sossusvlei, salt pans of Deadvlei and game-rich Etosha National Park on this ultimate Namibia luxury safari.",
    destinations: "Windhoek → Sossusvlei → Etosha → Swakopmund",
    includes: [
      "Professional guide",
      "Luxury lodge accommodation",
      "All meals",
      "Airport transfers",
      "Park entry fees",
    ],
    excludes: [
      "International flights",
      "Visa fees",
      "Travel insurance",
      "Personal items",
    ],
    highlights: [
      "Sossusvlei red dunes at sunrise",
      "Deadvlei salt pan",
      "Etosha game drives",
      "Swakopmund coastal town",
    ],
    availableDates: "Year-round, best Jun–Oct",
    minPeople: 2,
    maxPeople: 12,
  },
  {
    id: 2,
    title: "Botswana Okavango Fly-In Safari",
    location: "Botswana",
    category: "Fly-In Safaris",
    rating: 5,
    reviews: 22,
    price: 145000,
    oldPrice: null,
    days: 7,
    nights: 6,
    guests: 8,
    minAge: 6,
    img: "assets/gallery/okavango-delta-botswana-wetland-safari-mokoro-excursion.jpg",
    description:
      "Fly directly into the heart of the Okavango Delta, one of Africa's last great wilderness areas, and discover a world of mokoro rides, elephant encounters and extraordinary birdlife.",
    destinations: "Maun → Okavango Delta → Chobe NP → Kasane",
    includes: [
      "All charter flights within itinerary",
      "Full-board luxury tent lodges",
      "Twice-daily game activities",
      "Park fees",
      "Laundry service",
    ],
    excludes: [
      "International flights",
      "Visa fees",
      "Travel insurance",
      "Alcoholic beverages",
    ],
    highlights: [
      "Mokoro canoe rides",
      "Walking safaris",
      "Chobe elephant herds",
      "Sunset river cruises",
    ],
    availableDates: "Apr–Oct (dry season recommended)",
    minPeople: 2,
    maxPeople: 8,
  },
  {
    id: 3,
    title: "Rwanda Gorilla & Kigali Cultural",
    location: "Rwanda",
    category: "Cross-Border",
    rating: 4,
    reviews: 17,
    price: 120000,
    oldPrice: 135000,
    days: 6,
    nights: 5,
    guests: 10,
    minAge: 15,
    img: "assets/gallery/volcanoes-national-park-rwanda-gorilla-trekking.jpg",
    description:
      "Trek through the misty Volcanoes National Park to spend a magical hour with mountain gorillas, then explore vibrant Kigali and the serene shores of Lake Kivu.",
    destinations: "Kigali → Volcanoes NP → Lake Kivu",
    includes: [
      "Gorilla trekking permits",
      "Boutique lodge accommodation",
      "All meals",
      "Cultural experiences",
      "Professional gorilla guide",
    ],
    excludes: [
      "International flights",
      "Visa fees",
      "Travel insurance",
      "Tips",
    ],
    highlights: [
      "Mountain gorilla trekking",
      "Kigali city tour",
      "Lake Kivu sunset",
      "Genocide Memorial visit",
    ],
    availableDates: "Year-round; best Jun–Sep, Dec–Feb",
    minPeople: 2,
    maxPeople: 10,
  },
  {
    id: 4,
    title: "Zimbabwe Victoria Falls Adventure",
    location: "Zimbabwe",
    category: "Cross-Border",
    rating: 4,
    reviews: 11,
    price: 98000,
    oldPrice: null,
    days: 5,
    nights: 4,
    guests: 14,
    minAge: 12,
    img: "assets/gallery/victoria-falls-zimbabwe-waterfall-adventure.webp",
    description:
      "Stand at the edge of one of the world's Seven Natural Wonders, thrill at Hwange's wildlife and enjoy the best of Zimbabwe's iconic landscapes.",
    destinations: "Harare → Victoria Falls → Hwange NP",
    includes: [
      "Luxury lodge accommodation",
      "Victoria Falls guided tour",
      "Game drives in Hwange",
      "All meals",
      "Airport transfers",
    ],
    excludes: [
      "International flights",
      "Visa fees",
      "Optional activities (e.g. bungee)",
      "Travel insurance",
    ],
    highlights: [
      "Victoria Falls walking tour",
      "Hwange elephant encounters",
      "Sunset dinner",
      "Helicopter flight (optional)",
    ],
    availableDates: "Apr–Dec recommended",
    minPeople: 2,
    maxPeople: 14,
  },
  {
    id: 5,
    title: "Kenya Maasai Mara Great Migration",
    location: "Kenya",
    category: "Family Safaris",
    rating: 5,
    reviews: 27,
    price: 110000,
    oldPrice: 125000,
    days: 7,
    nights: 6,
    guests: 16,
    minAge: 6,
    img: "assets/gallery/maasai-mara-kenya-safari-wildlife.jpg",
    description:
      "Witness one of nature's greatest spectacles, the Great Wildebeest Migration, in the Maasai Mara, and explore Nairobi's vibrant culture and Amboseli's Kilimanjaro views.",
    destinations: "Nairobi → Amboseli NP → Maasai Mara",
    includes: [
      "Safari lodge accommodation",
      "All game drives",
      "Maasai village visit",
      "All meals",
      "Park fees",
    ],
    excludes: [
      "International flights",
      "Visa fees",
      "Travel insurance",
      "Balloon safari (optional)",
    ],
    highlights: [
      "Great Migration river crossings",
      "Big Five encounters",
      "Kilimanjaro backdrop in Amboseli",
      "Maasai cultural experience",
    ],
    availableDates: "Year-round; migration Jul–Oct",
    minPeople: 2,
    maxPeople: 16,
  },
  {
    id: 6,
    title: "Tanzania Serengeti & Zanzibar Combo",
    location: "Tanzania",
    category: "Self-Drive",
    rating: 4,
    reviews: 19,
    price: 135000,
    oldPrice: null,
    days: 10,
    nights: 9,
    guests: 8,
    minAge: 6,
    img: "assets/gallery/serengeti-national-park-tanzania-safari-wildlife.jpg",
    description:
      "Combine the raw wilderness of the Serengeti with the turquoise beaches of Zanzibar for the ultimate African adventure: safari by day, spice island relaxation by night.",
    destinations: "Arusha → Serengeti → Ngorongoro → Zanzibar",
    includes: [
      "Safari tented camp accommodation",
      "Beach resort (Zanzibar)",
      "All safari meals",
      "Spice tour in Zanzibar",
      "Airport transfers",
    ],
    excludes: [
      "International flights",
      "Visa fees",
      "Travel insurance",
      "Diving/snorkelling (optional)",
    ],
    highlights: [
      "Serengeti wildlife spectacle",
      "Ngorongoro Crater game drive",
      "Zanzibar Stone Town walk",
      "Pristine Zanzibar beaches",
    ],
    availableDates: "Year-round; safari best Jun–Oct, Feb–Mar",
    minPeople: 2,
    maxPeople: 8,
  },
];

const REVIEWS = [
  {
    name: "Sarah Thompson",
    country: "United Kingdom",
    rating: 5,
    text: "Zusammen Tours completely exceeded our expectations. Our Namibia fly-in safari was flawlessly organised, from the luxury lodges to the expert guides. Every detail was taken care of, leaving us free to simply soak in the incredible landscapes. We will absolutely be booking with them again!",
    img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=80&q=80",
    tour: "Namibia Desert & Etosha Safari",
  },
  {
    name: "James & Linda Müller",
    country: "Germany",
    rating: 5,
    text: "We celebrated our 25th anniversary with a gorilla trekking experience in Rwanda arranged by Zusammen Tours. The moment we came face to face with a mountain gorilla family will stay with us forever. The team made every detail seamless and personal. Truly unforgettable.",
    img: "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=80&q=80",
    tour: "Rwanda Gorilla & Kigali Cultural",
  },
  {
    name: "Michael & Priya Naidoo",
    country: "Canada",
    rating: 5,
    text: "From our first enquiry to our final transfer home, Zusammen Tours was professional, warm and incredibly knowledgeable about Africa. Our Okavango Delta fly-in safari was beyond anything we could have imagined: pure wilderness, exceptional lodges and unforgettable game sightings.",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80",
    tour: "Botswana Okavango Fly-In Safari",
  },
  {
    name: "Anna Johansson",
    country: "Sweden",
    rating: 5,
    text: "I travelled solo to Zimbabwe and Zambia, and Zusammen Tours made me feel safe and completely at ease from start to finish. Seeing Victoria Falls for the first time was breathtaking. The guides were knowledgeable, friendly and made the trip truly special for me.",
    img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&q=80",
    tour: "Zimbabwe Victoria Falls Adventure",
  },
  {
    name: "David & Carol Hayes",
    country: "United States",
    rating: 5,
    text: "We brought our whole family, including three teenagers, on the Kenya safari and it was absolutely the trip of a lifetime. Witnessing the Great Migration was a moment none of us will ever forget. Zusammen Tours planned every detail perfectly and the kids are already asking when we can go back!",
    img: "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=80&q=80",
    tour: "Kenya Maasai Mara Great Migration",
  },
];

const CATEGORIES = [
  {
    name: "Cross-Border",
    icon: "fa-globe-africa",
    count: "3 Tours",
    img: "assets/gallery/chobe-national-park-botswana-wildlife-safari.jpg",
    desc: "Explore multiple African countries on one seamless luxury journey.",
  },
  {
    name: "Family Safaris",
    icon: "fa-users",
    count: "4 Tours",
    img: "assets/gallery/maasai-mara-kenya-safari-wildlife.jpg",
    desc: "Child-friendly safaris designed for the whole family to enjoy together.",
  },
  {
    name: "Fly-In Safaris",
    icon: "fa-plane",
    count: "4 Tours",
    img: "assets/gallery/okavango-delta-botswana-wetland-safari-mokoro-excursion.jpg",
    desc: "Reach remote wilderness areas by light aircraft for exclusive access.",
  },
  {
    name: "Luxury Safaris",
    icon: "fa-crown",
    count: "6 Tours",
    img: "assets/gallery/serengeti-national-park-tanzania-safari-wildlife.jpg",
    desc: "Premier lodges, private game reserves and bespoke service throughout.",
  },
  {
    name: "Self-Drive",
    icon: "fa-car",
    count: "3 Tours",
    img: "assets/gallery/sossusvlei-namibia-red-sand-dunes-and-deadvlei-clay-pan-at-sunrise.jpg",
    desc: "Explore at your own pace with expert route planning and support.",
  },
  {
    name: "Group Travel",
    icon: "fa-bus",
    count: "0 Tours",
    img: "assets/gallery/maasai-mara-kenya-safari-wildlife.jpg",
    desc: "Shared group departures with like-minded travellers across Africa.",
  },
];

const BLOGS = [
  {
    id: 1,
    title: "Why Booking Through a Travel Agency Still Matters in 2026",
    tag: "Travel Tips",
    excerpt:
      "Even in 2026, with the rise of travel apps and online booking platforms, using a trusted travel agency remains one of the smartest ways to plan a trip across Africa.",
    img: "assets/blogs/Why Booking Through a Travel Agency Still Matters in 2026.jpg",
    date: "15 Jan 2026",
    author: "Zusammen Tours",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "Unusual Accommodation Experiences in Africa: Beyond the Ordinary",
    tag: "Accommodation",
    excerpt:
      "From treetop lodges in the Okavango to desert geodesic domes under Namibia's stars, Africa offers accommodation experiences that become part of your travel story.",
    img: "assets/blogs/Unusual Accommodation Experiences in Africa.jpg",
    date: "08 Feb 2026",
    author: "Zusammen Tours",
    readTime: "6 min read",
  },
  {
    id: 3,
    title: "Travelling Solo in Africa: Empowerment, Adventure and Connection",
    tag: "Solo Travel",
    excerpt:
      "There's something uniquely liberating about travelling alone across Africa's diverse nations, from Namibia's vast deserts to Zimbabwe's spectacular waterfalls.",
    img: "assets/blogs/Travelling Solo in Africa.jpg",
    date: "22 Feb 2026",
    author: "Zusammen Tours",
    readTime: "8 min read",
  },
  {
    id: 4,
    title:
      "Travel Mistakes to Avoid in Africa (Especially for First-Time Visitors)",
    tag: "Travel Tips",
    excerpt:
      "Africa is a dream destination, but first-time visitors can sometimes make mistakes that impact their trip. Here's what to watch out for and how to avoid it.",
    img: "assets/blogs/Travel Mistakes to Avoid in Africa.jpg",
    date: "01 Mar 2026",
    author: "Zusammen Tours",
    readTime: "7 min read",
  },
  {
    id: 5,
    title: "Top Romantic Destinations in Africa for Couples",
    tag: "Romance",
    excerpt:
      "From golden desert dunes in Namibia to gorilla trekking in Rwanda and the sparkling shores of Zanzibar, Africa is extraordinarily romantic for couples.",
    img: "assets/blogs/Top Romantic Destinations in Africa for Couples.jpg",
    date: "12 Mar 2026",
    author: "Zusammen Tours",
    readTime: "6 min read",
  },
  {
    id: 6,
    title:
      "Africa Beyond the Famous: Underrated Spots Every Traveller Should Explore",
    tag: "Destinations",
    excerpt:
      "Beyond Victoria Falls, the Serengeti and the Namib lie hidden gems that few travellers discover, from Damaraland's rock engravings to Zambia's intimate Lower Zambezi.",
    img: "assets/blogs/Africa Beyond the Famous Underrated Spots Every Traveller S....jpg",
    date: "25 Mar 2026",
    author: "Zusammen Tours",
    readTime: "9 min read",
  },
];

const FAQS = [
  {
    q: "What types of tours or travel packages do you offer?",
    a: "We offer luxury tours in Namibia and 8 other incredible destinations across Africa, including Botswana, Kenya, Rwanda, South Africa, Tanzania, Uganda, Zambia and Zimbabwe. Our tours include adventure, cultural, family-friendly, group and solo travel packages. Many of our trips are fully customisable to match your interests and schedule.",
  },
  {
    q: "How do I book a tour or package?",
    a: 'Booking is simple! You can submit an enquiry online through our website by clicking "SEND REQUEST NOW" on any tour, call our travel specialists directly, or visit our office in Windhoek. Once your booking is confirmed, you\'ll receive all travel details via email.',
  },
  {
    q: "What is included in the tour/package price?",
    a: "Our packages usually include accommodation, daily meals, airport transfers, guided tours and entry fees to attractions. Optional activities or upgrades may have additional costs, which will always be clearly communicated upfront.",
  },
  {
    q: "Are there any hidden fees or extra costs?",
    a: "No hidden fees! Any optional activities, tips or special requests will be clearly listed upfront so you can plan your budget with confidence. We believe in complete transparency.",
  },
  {
    q: "What is your cancellation and refund policy?",
    a: "You can cancel or reschedule your trip according to our policy. Refund amounts depend on the timing of your cancellation. Full details are available on our Terms & Conditions page or from our customer support team.",
  },
  {
    q: "Do I need travel insurance?",
    a: "We strongly recommend travel insurance to cover medical emergencies, trip cancellations or lost luggage. Some destinations may require it, and our team can advise on the best coverage for your specific trip.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept credit and debit cards, bank transfers and secure online payments. For larger trips, instalment plans may also be available. Please speak to our team for details.",
  },
  {
    q: "Are your tours suitable for families, children or people with special needs?",
    a: "Yes! We have family-friendly packages and tours designed for travellers of all ages. Accessibility varies by destination, so please contact us for personalised assistance or special accommodations.",
  },
  {
    q: "Do you provide visa or travel documentation assistance?",
    a: "Yes, we can guide you through visa applications, passport requirements and other travel documents. Some services may have additional fees, which we will clearly inform you about in advance.",
  },
  {
    q: "How can I contact you if I need assistance before or during my trip?",
    a: "You can reach us via phone, email, live chat or social media. For emergencies while travelling, we provide a 24/7 support line to ensure you have help whenever you need it.",
  },
];

const PARTNERS = [
  { name: "andBeyond", file: "assets/partners/andBeyond Logo.png" },
  { name: "Angama", file: "assets/partners/angama-logo-white.png" },
  { name: "Chiawa Safaris", file: "assets/partners/Chiawa Safaris.png" },
  { name: "Chiwani Camps", file: "assets/partners/Chiwani Camps.webp" },
  { name: "City Lodge Hotels", file: "assets/partners/City Lodge Hotels.png" },
  { name: "Hilton Hotels", file: "assets/partners/Hilton Hotel & Resorts.png" },
  {
    name: "More Family Collection",
    file: "assets/partners/more family collection.png",
  },
  {
    name: "Natural Selection",
    file: "assets/partners/Natural Selection Logo.png",
  },
  { name: "Ondili", file: "assets/partners/ondili-logo.png" },
  { name: "One&Only", file: "assets/partners/one and only.png" },
  { name: "Ongava", file: "assets/partners/Ongava.png" },
  {
    name: "Onguma Lodge",
    file: "assets/partners/Onguma Lodge Etosha National Park.png",
  },
  {
    name: "Wilderness Air",
    file: "assets/partners/botswana wilderness air.png",
  },
  { name: "Red Carnation", file: "assets/partners/Red Carnation Logo.png" },
  { name: "Time + Tide", file: "assets/partners/Time Tide.png" },
  {
    name: "Virgin Limited Edition",
    file: "assets/partners/Virgin Limited Edition.png",
  },
  {
    name: "Wilderness",
    file: "assets/partners/Wilderness-Logo-400x284-1.png",
  },
  {
    name: "Zambezi Crescent",
    file: "assets/partners/Zambezi Crescent Collection.png",
  },
];

/* ===== STATE ===== */
let adultCount = 1,
  childCount = 0;
let currentTourPage = 0; // slider index
let currentTestiSlide = 0;
let testiInterval, toursSliderInterval;

/* ===== UTILITIES ===== */
const fmt = (n) => "N$" + n.toLocaleString("en-ZA");
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const stars = (n) =>
  '<i class="fas fa-star"></i>'.repeat(n) +
  '<i class="fas fa-star"></i>'.repeat(5 - n).replace(/fas/g, "far");

function showToast(msg) {
  let t = document.createElement("div");
  t.style.cssText = `position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:var(--dark);color:#fff;padding:12px 24px;border-radius:50px;font-family:var(--font-head);font-size:14px;font-weight:600;z-index:99999;box-shadow:0 8px 24px rgba(0,0,0,0.25);animation:toastIn .3s ease;white-space:nowrap`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transition = "opacity .3s";
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

/* ===== HEADER ===== */
function initHeader() {
  const header = $(".site-header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 60);
    $("#btt")?.classList.toggle("show", window.scrollY > 400);
  });
  // Mobile nav
  const ham = $("#hamburger");
  const mNav = $("#mobileNav");
  const mClose = $("#mobileClose");
  ham?.addEventListener("click", () => {
    mNav.classList.add("open");
    document.body.style.overflow = "hidden";
  });
  mClose?.addEventListener("click", () => {
    mNav.classList.remove("open");
    document.body.style.overflow = "";
  });

  // Nav dropdown toggle (click-based, works on all devices)
  document.querySelectorAll('.nav-item > a').forEach(link => {
    link.addEventListener('click', function(e) {
      const dropdown = this.parentElement.querySelector('.nav-dropdown');
      if (!dropdown) return;
      e.preventDefault();
      document.querySelectorAll('.nav-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });
      dropdown.classList.toggle('open');
      const chevron = this.querySelector('.fa-chevron-down');
      if (chevron) {
        chevron.style.transform = dropdown.classList.contains('open')
          ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    });
  });

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-item')) {
      document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    }
  });

  // Re-apply dropdown hover listeners after any page JS runs (safety net for tour-detail)
  setTimeout(() => {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        const dd = item.querySelector('.nav-dropdown');
        if (dd) dd.style.display = 'block';
      });
      item.addEventListener('mouseleave', () => {
        const dd = item.querySelector('.nav-dropdown');
        if (dd) dd.style.display = '';
      });
    });
  }, 100);
}

/* ===== SEARCH BOX ===== */
function initSearch() {
  // Duration dropdown
  const durWrap = $("#durWrap");
  const durVal = $("#durVal");
  if (durWrap) {
    durWrap.addEventListener("click", (e) => {
      e.stopPropagation();
      durWrap.classList.toggle("drop-open");
      $("#travWrap")?.classList.remove("trav-open");
    });
    $$(".dur-option").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        durVal.textContent = a.dataset.val ? a.textContent : "Select duration";
        durVal.classList.toggle("ph", !a.dataset.val);
        durWrap.classList.remove("drop-open");
      });
    });
  }

  // Travelers
  const travWrap = $("#travWrap");
  const travVal = $("#travVal");
  if (travWrap) {
    travWrap.addEventListener("click", (e) => {
      e.stopPropagation();
      travWrap.classList.toggle("trav-open");
      durWrap?.classList.remove("drop-open");
    });
  }

  window.adjCount = function (type, d, e) {
    e.stopPropagation();
    if (type === "ad") {
      adultCount = Math.max(1, adultCount + d);
      $("#adCnt").textContent = adultCount;
    } else {
      childCount = Math.max(0, childCount + d);
      $("#chCnt").textContent = childCount;
    }
  };
  window.cancelTrav = function (e) {
    e.stopPropagation();
    travWrap?.classList.remove("trav-open");
  };
  window.applyTrav = function (e) {
    e.stopPropagation();
    const t = adultCount + childCount;
    if (travVal) travVal.textContent = `${t} Person${t > 1 ? "s" : ""}`;
    travWrap?.classList.remove("trav-open");
  };

  // Close on outside click
  document.addEventListener("click", () => {
    durWrap?.classList.remove("drop-open");
    travWrap?.classList.remove("trav-open");
  });

  // Search btn
  $("#searchBtn")?.addEventListener("click", () => {
    const dest = $("#destInput")?.value?.trim();
    if (!dest) {
      $("#destInput")?.focus();
      showToast("Please enter a destination");
      return;
    }
    showToast(`Searching for tours in "${dest}"...`);
    setTimeout(() => {
      window.location.href = "pages/tours?q=" + encodeURIComponent(dest);
    }, 800);
  });
}

/* ===== CATEGORIES ===== */
function buildCategories() {
  const grid = $("#catGrid");
  if (!grid) return;
  grid.innerHTML = CATEGORIES.map(
    (c) => {
      const n = TOURS.filter(t =>
        t.category?.toLowerCase() === c.name.toLowerCase()
      ).length;
      return `
    <a href="pages/tours?cat=${encodeURIComponent(c.name)}" class="cat-card">
      <img src="${c.img}" alt="${c.name}" loading="lazy">
      <div class="cat-overlay">
        <div class="cat-icon"><i class="fas ${c.icon}"></i></div>
        <h5>${c.name}</h5>
        <span>${n} ${n === 1 ? 'Tour' : 'Tours'}</span>
      </div>
      <div class="cat-arrow"><i class="fas fa-arrow-right"></i></div>
    </a>
  `;
    }
  ).join("");
}

function initCategoryModal() {
  const btn = $("#viewAllCatsBtn");
  const modal = $("#catModal");
  const close = $("#catModalClose");
  const list = $("#catModalList");
  if (!btn || !modal) return;
  if (list) {
    list.innerHTML = CATEGORIES.map(
      (c) => `
      <a href="pages/tours?cat=${encodeURIComponent(c.name)}" class="cat-list-item">
        <div class="cat-list-icon"><i class="fas ${c.icon}"></i></div>
        <div>
          <h6>${c.name}</h6>
          <p>${c.desc}</p>
        </div>
        <i class="fas fa-chevron-right" style="margin-left:auto;color:var(--border);font-size:12px"></i>
      </a>
    `,
    ).join("");
  }
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  });
  close?.addEventListener("click", () => {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    }
  });
}

/* ===== TOURS SLIDER ===== */
let SLIDER_TOURS = TOURS;

function mixToursByCountry(tours) {
  // Group tours by location/country
  const byCountry = {};
  tours.forEach((t) => {
    const loc = t.location || "Other";
    if (!byCountry[loc]) byCountry[loc] = [];
    byCountry[loc].push(t);
  });

  // Round-robin pick from each country
  const mixed = [];
  const countries = Object.keys(byCountry);
  let maxLen = Math.max(...countries.map((c) => byCountry[c].length));

  for (let i = 0; i < maxLen; i++) {
    countries.forEach((country) => {
      if (byCountry[country][i]) {
        mixed.push(byCountry[country][i]);
      }
    });
  }

  return mixed;
}

function getVisibleTours() {
  if (window.innerWidth < 600) return 1;
  if (window.innerWidth < 900) return 2;
  return 3;
}

function getTotalPages() {
  return Math.ceil(SLIDER_TOURS.length / getVisibleTours());
}

function buildToursSlider() {
  const wrap = document.getElementById("toursSlider")?.parentElement;
  const slider = document.getElementById("toursSlider");
  if (!slider || !wrap) return;

  SLIDER_TOURS = mixToursByCountry(TOURS).slice(0, 9);

  slider.innerHTML = SLIDER_TOURS.map((t) => buildTourCard(t)).join("");

  // Wait for browser to paint before measuring offsetWidth
  requestAnimationFrame(() => {
    sizeSlider();
    updateToursSlider();
  });

  // Resize handler — debounced
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      currentTourPage = 0;
      sizeSlider();
      updateToursSlider();
    }, 150);
  });

  // Dots
  const dots = document.getElementById("toursDots");
  if (dots) {
    const rebuildDots = () => {
      const total = getTotalPages();
      dots.innerHTML = Array.from(
        { length: total },
        (_, i) =>
          `<button class="slider-dot ${i === 0 ? "active" : ""}" data-i="${i}"></button>`,
      ).join("");
      dots.querySelectorAll(".slider-dot").forEach((d) =>
        d.addEventListener("click", () => {
          currentTourPage = +d.dataset.i;
          updateToursSlider();
          clearInterval(toursSliderInterval);
          startToursAuto();
        }),
      );
    };
    rebuildDots();
    window.addEventListener("resize", rebuildDots);
  }

  document.getElementById("toursNext")?.addEventListener("click", () => {
    currentTourPage = (currentTourPage + 1) % getTotalPages();
    updateToursSlider();
    clearInterval(toursSliderInterval);
    startToursAuto();
  });
  document.getElementById("toursPrev")?.addEventListener("click", () => {
    currentTourPage = (currentTourPage - 1 + getTotalPages()) % getTotalPages();
    updateToursSlider();
    clearInterval(toursSliderInterval);
    startToursAuto();
  });

  startToursAuto();
}

function sizeSlider() {
  const wrap = document.getElementById("toursSlider")?.parentElement;
  const slider = document.getElementById("toursSlider");
  if (!slider || !wrap) return;

  // Temporarily remove transform so offsetWidth is accurate
  slider.style.transition = "none";
  slider.style.transform = "translateX(0)";

  const visible = getVisibleTours();
  const wrapWidth = wrap.offsetWidth; // measured after reset

  if (wrapWidth === 0) {
    // DOM not ready yet — retry
    requestAnimationFrame(sizeSlider);
    return;
  }

  const slotWidth = wrapWidth / visible;

  // Set each slot to exact pixel width
  slider.querySelectorAll(".slide-slot").forEach((slot) => {
    slot.style.width = slotWidth + "px";
    slot.style.minWidth = slotWidth + "px";
    slot.style.maxWidth = slotWidth + "px";
  });

  // Total track width = number of cards × slot width
  slider.style.width = slotWidth * SLIDER_TOURS.length + "px";

  // Re-enable transition
  requestAnimationFrame(() => {
    slider.style.transition =
      "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)";
  });
}

function startToursAuto() {
  toursSliderInterval = setInterval(() => {
    currentTourPage = (currentTourPage + 1) % getTotalPages();
    updateToursSlider();
  }, 5000);
}

function updateToursSlider() {
  const wrap = document.getElementById("toursSlider")?.parentElement;
  const slider = document.getElementById("toursSlider");
  if (!slider || !wrap) return;

  const visible = getVisibleTours();
  const wrapWidth = wrap.offsetWidth;
  if (wrapWidth === 0) return;

  // Read slot width from the DOM (set by sizeSlider)
  const firstSlot = slider.querySelector(".slide-slot");
  const slotWidth = firstSlot ? firstSlot.offsetWidth : wrapWidth / visible;
  const pxOffset = currentTourPage * visible * slotWidth;

  slider.style.transform = `translateX(-${pxOffset}px)`;

  // Update dots
  document
    .querySelectorAll(".slider-dot")
    .forEach((d, i) => d.classList.toggle("active", i === currentTourPage));
}

function buildTourCard(t) {
  const rating = t.rating || 4;
  const imgSrc = t.img || t.image_url || null;
  const imgHtml = imgSrc
    ? `<img src="${imgSrc}" alt="${t.title}" loading="lazy" referrerpolicy="no-referrer" crossorigin="anonymous" onerror="this.style.display='none'">`
    : "";
  return `
    <div class="slide-slot">
      <div class="tour-card" data-id="${t.id}">
        <div class="tour-img">
          ${imgHtml}
          ${t.rating >= 5 ? '<span class="tour-badge"><i class="fas fa-star"></i> Top Rated</span>' : ''}
          <span class="tour-cat">${t.category}</span>
          <button class="tour-wishlist" onclick="event.stopPropagation();toggleWishlist(this)" title="Save">
            <i class="fas fa-heart"></i>
          </button>
        </div>
        <div class="tour-body">
          <div class="tour-rating">
            <span class="stars">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</span>
            <span>${rating}.0</span>
            <span class="count">(${t.reviews} Reviews)</span>
          </div>
          <h5>${t.title}</h5>
          <div class="tour-loc"><i class="fas fa-map-marker-alt"></i> ${t.location}</div>
          <div class="tour-divider"></div>
          <div class="tour-footer-row">
            <div class="tour-price">
              <div class="from-lbl">Starts From</div>
              <span class="amount">${fmt(t.price)}</span>
              ${t.oldPrice ? `<span class="old-price">${fmt(t.oldPrice)}</span>` : ""}
            </div>
            <div class="tour-meta-row">
              <span><i class="fas fa-clock"></i> ${t.days}D/${t.nights}N</span>
              <span><i class="fas fa-users"></i> ${t.guests}</span>
            </div>
          </div>
          <button class="send-request-btn" onclick="event.stopPropagation();window.location='pages/tour-detail?id=${t.id}'">
            <i class="fas fa-compass"></i> View Tour
          </button>
        </div>
      </div>
    </div>
  `;
}

window.toggleWishlist = function (btn) {
  btn.classList.toggle("active");
  const saved = btn.classList.contains("active");
  btn.querySelector("i").style.color = saved ? "#ef4444" : "";
  showToast(saved ? "Added to wishlist ❤️" : "Removed from wishlist");
};

/* ===== BLOGS ===== */
function buildBlogs() {
  const grid = $("#blogsGrid");
  if (!grid) return;
  const displayed = BLOGS.slice(0, 3);
  grid.innerHTML = displayed
    .map(
      (b) => {
        const bImg = b.img || b.image_url || null;
        return `
    <div class="blog-card">
      ${bImg ? `<div class="blog-img">
        <img src="${bImg}" alt="${b.title}" loading="lazy" referrerpolicy="no-referrer" crossorigin="anonymous" onerror="this.parentElement.style.display='none'">
        <span class="blog-tag-badge">${b.tag}</span>
      </div>` : ""}
      <div class="blog-body">
        <div class="blog-meta">
          <span><i class="fas fa-user"></i> ${b.author}</span>
          <span><i class="fas fa-calendar"></i> ${b.date}</span>
          <span><i class="fas fa-clock"></i> ${b.readTime}</span>
        </div>
        <h5>${b.title}</h5>
        <p>${b.excerpt}</p>
        <a href="pages/blog-detail?id=${b.id}" class="blog-read-more">Read More <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  `;
      })
    .join("");
}

/* ===== TESTIMONIALS SLIDER ===== */
function buildTestimonials() {
  const slider = document.getElementById("testiSlider");
  const dots = document.getElementById("testiDots");
  if (!slider) return;

  // Build slides — each slide is exactly 100% of the slider-wrap width
  slider.innerHTML = REVIEWS.map(
    (r) => `
    <div class="testi-slide">
      <div class="testi-card">
        <span class="testi-quote">&#8220;</span>
        <div class="testi-stars">${'<i class="fas fa-star"></i>'.repeat(r.rating)}</div>
        <p class="testi-text">&ldquo;${r.text}&rdquo;</p>
        <div class="testi-author">
          <img src="${r.img}" alt="${r.name}"
               onerror="this.outerHTML='<div style=\'width:48px;height:48px;border-radius:50%;background:var(--bg2);flex-shrink:0\'></div>'">
          <div>
            <h6>${r.name}</h6>
            <span>${r.country}&nbsp;&middot;&nbsp;${r.tour}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  ).join("");

  // Build dots
  if (dots) {
    dots.innerHTML = REVIEWS.map(
      (_, i) =>
        `<button class="testi-dot ${i === 0 ? "active" : ""}" data-i="${i}" aria-label="Review ${i + 1}"></button>`,
    ).join("");
    dots.querySelectorAll(".testi-dot").forEach((d) =>
      d.addEventListener("click", () => {
        currentTestiSlide = +d.dataset.i;
        updateTesti();
        clearInterval(testiInterval);
        startTestiAuto();
      }),
    );
  }

  startTestiAuto();
}

function startTestiAuto() {
  testiInterval = setInterval(() => {
    currentTestiSlide = (currentTestiSlide + 1) % REVIEWS.length;
    updateTesti();
  }, 5000);
}

function updateTesti() {
  const slider = document.getElementById("testiSlider");
  if (!slider) return;

  // Use pixel-based translation (same bulletproof approach as tour slider)
  const wrap = slider.parentElement;
  const wrapW = wrap ? wrap.offsetWidth : 0;
  const offset =
    wrapW > 0
      ? currentTestiSlide * wrapW // px per slide = wrap width
      : currentTestiSlide * 100; // fallback (shouldn't happen)

  // If wrapWidth is 0 DOM not ready — translateX % still works here because
  // each .testi-slide is min-width:100% of the flex parent which IS the wrap
  slider.style.transform = `translateX(-${currentTestiSlide * 100}%)`;

  // Sync dots
  document
    .querySelectorAll(".testi-dot")
    .forEach((d, i) => d.classList.toggle("active", i === currentTestiSlide));
}

/* ===== PARTNERS ===== */
function buildPartners() {
  const track = document.getElementById("partnersTrack");
  if (!track) return;
  const items = [...PARTNERS, ...PARTNERS]; // double for seamless loop
  track.innerHTML = items
    .map(
      (p) => `
    <div class="partner-logo">
      <img src="${p.file}" alt="${p.name}" style="height:96px;max-width:260px;object-fit:contain;filter:brightness(0) invert(1);opacity:0.55;transition:all .25s;cursor:pointer" onmouseover="this.style.opacity=1;this.style.filter='none'" onmouseout="this.style.opacity=0.55;this.style.filter='brightness(0) invert(1)'">
    </div>
  `,
    )
    .join("");
}

/* ===== FAQ ===== */
function buildFaqs() {
  const list = $("#faqList");
  if (!list) return;
  list.innerHTML = FAQS.map(
    (f, i) => `
    <div class="faq-item ${i === 0 ? "open" : ""}" onclick="toggleFaq(this)">
      <div class="faq-q">${f.q} <i class="fas fa-plus"></i></div>
      <div class="faq-a">${f.a}</div>
    </div>
  `,
  ).join("");
}

window.toggleFaq = function (el) {
  el.classList.toggle("open");
};

/* ===== ENQUIRY MODAL ===== */
window.openEnquiry = function (tourId) {
  const tour = TOURS.find((t) => t.id === tourId);
  const modal = $("#enquiryModal");
  if (!modal) return;
  const nameEl = $("#enquiryTourName");
  const inputEl = $("#enquiryTourInput");
  if (nameEl) nameEl.textContent = tour ? `Enquiry for: ${tour.title}` : "";
  if (inputEl) inputEl.value = tour ? tour.title : "";
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
};

window.closeEnquiry = function () {
  const modal = $("#enquiryModal");
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
};

function initEnquiryForm() {
  const modal = $("#enquiryModal");
  const form = $("#enquiryForm");
  if (!form) return;
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeEnquiry();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = "Sending...";
    btn.disabled = true;

    const tourName = $("#enquiryTourInput")?.value || "";
    const result = await window.WPAPI.submitEnquiry(form, tourName);

    if (result.success) {
      const content = form.closest(".enquiry-box").querySelector(".enquiry-content");
      const success = form.closest(".enquiry-box").querySelector(".form-success");
      if (content) content.style.display = "none";
      if (success) success.style.display = "block";
      setTimeout(closeEnquiry, 3000);
    } else {
      showToast("Could not send enquiry: " + (result.error || "unknown error"), "error");
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}


/* ===== LODGES ===== */
const LODGES = [
  {
    name: "Little Kulala Lodge",
    loc: "Sossusvlei, Namibia",
    type: "Desert Lodge",
    img: "assets/gallery/sossusvlei-namibia-red-sand-dunes-and-deadvlei-clay-pan-at-sunrise.jpg",
  },
  {
    name: "Zarafa Camp",
    loc: "Okavango Delta, Botswana",
    type: "Fly-In Camp",
    img: "assets/gallery/okavango-delta-botswana-wetland-safari-mokoro-excursion.jpg",
  },
  {
    name: "Bisate Lodge",
    loc: "Volcanoes NP, Rwanda",
    type: "Eco Lodge",
    img: "assets/gallery/volcanoes-national-park-rwanda-gorilla-trekking.jpg",
  },
  {
    name: "Singita Pamushana",
    loc: "Malilangwe, Zimbabwe",
    type: "Bush Lodge",
    img: "assets/gallery/victoria-falls-zimbabwe-waterfall-adventure.webp",
  },
  {
    name: "Angama Mara",
    loc: "Maasai Mara, Kenya",
    type: "Cliff Lodge",
    img: "assets/gallery/maasai-mara-kenya-safari-wildlife.jpg",
  },
  {
    name: "Ngorongoro Crater Lodge",
    loc: "Ngorongoro, Tanzania",
    type: "Luxury Camp",
    img: "assets/gallery/ngorongoro-crater-tanzania-wildlife-safari.jpg",
  },
  {
    name: "Mombo Camp",
    loc: "Moremi, Botswana",
    type: "Tented Camp",
    img: "assets/gallery/chobe-national-park-botswana-wildlife-safari.jpg",
  },
  {
    name: "Royal Chundu",
    loc: "Zambezi, Zambia",
    type: "River Lodge",
    img: "assets/gallery/lower-zambezi-national-park-zambia-river-safari.jpg",
  },
];

function buildLodges() {
  const grid = $("#lodgesGrid");
  if (!grid) return;
  grid.innerHTML = LODGES.slice(0, 4)
    .map(
      (l) => `
    <div class="lodge-card">
      <div class="lodge-img">
        <img src="${l.img}" alt="${l.name}" loading="lazy">
      </div>
      <div class="lodge-body">
        <div class="lodge-type">${l.type}</div>
        <h5>${l.name}</h5>
        <div class="lodge-loc"><i class="fas fa-map-marker-alt"></i> ${l.loc}</div>
      </div>
    </div>
  `,
    )
    .join("");
}

/* ===== STATS COUNTER ===== */
function initStatsCounter() {
  const statNums = document.querySelectorAll(".stat-number");
  if (!statNums.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (
          entry.isIntersecting &&
          !entry.target.classList.contains("counted")
        ) {
          entry.target.classList.add("counted");
          animateCount(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  statNums.forEach((el) => observer.observe(el));
}

function animateCount(el) {
  const target = parseInt(el.dataset.target || el.textContent);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const suffix = el.dataset.suffix || "";
  const prefix = el.dataset.prefix || "";

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = prefix + Math.floor(current) + suffix;
  }, 16);
}

/* ===== CONTACT FORM ===== */
function initContactForm() {
  const form = $("#contactForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.innerHTML;
    btn.textContent = "Sending...";
    btn.disabled = true;

    const result = await window.WPAPI.submitEnquiry(form, form.querySelector('[name="subject"]')?.value || "General Enquiry");

    if (result.success) {
      showToast("Your message has been sent. We'll be in touch soon!", "success");
      form.reset();
    } else {
      showToast("Could not send message: " + (result.error || "unknown error"), "error");
    }
    btn.innerHTML = originalText;
    btn.disabled = false;
  });
}

/* ===== INIT ===== */
document.addEventListener("DOMContentLoaded", async () => {
  initHeader();
  initSearch();
  initCategoryModal();

  if (window.WPAPI) {
    const apiTours = await WPAPI.fetchTours();
    if (apiTours && apiTours.length) {
      TOURS.length = 0;
      TOURS.push(...apiTours);
    }
  }

  buildCategories();
  buildToursSlider();
  buildBlogs();
  buildTestimonials();
  buildPartners();
  buildFaqs();
  buildLodges();
  initEnquiryForm();
  initContactForm();
  initStatsCounter();
});

/* expose for other pages */
window.ZT = {
  TOURS,
  BLOGS,
  REVIEWS,
  CATEGORIES,
  FAQS,
  LODGES,
  PARTNERS,
  buildTourCard,
  fmt,
  stars,
  openEnquiry,
};
