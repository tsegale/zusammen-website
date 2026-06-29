const db = require("./db");

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  await db.initDb();

  const tourCount = db.prepare("SELECT COUNT(*) AS n FROM tours").get().n;
  if (tourCount > 6 && !process.env.FORCE_SEED) {
    console.error(`\nABORT: ${tourCount} tours found in database.`);
    console.error("Refusing to wipe a populated database.");
    console.error("To override: FORCE_SEED=true node database/seed.js\n");
    process.exit(1);
  }
  if (tourCount > 6) {
    console.warn(`WARNING: FORCE_SEED=true — deleting ${tourCount} existing tours.\n`);
  }

  console.log("Seeding database...");

  db.exec(`
    DELETE FROM enquiries;
    DELETE FROM faqs;
    DELETE FROM blogs;
    DELETE FROM tours;
  `);

  /* ── TOURS ──────────────────────────────────────────────────── */
  const insertTour = db.prepare(`
    INSERT INTO tours (
      title, slug, location, category, rating, reviews,
      price, old_price, days, nights, guests, min_age,
      min_people, max_people, description, destinations,
      includes, excludes, highlights, available_dates, image_url
    ) VALUES (
      @title, @slug, @location, @category, @rating, @reviews,
      @price, @old_price, @days, @nights, @guests, @min_age,
      @min_people, @max_people, @description, @destinations,
      @includes, @excludes, @highlights, @available_dates, @image_url
    )
  `);

  const TOURS = [
    {
      title: "Namibia Desert & Etosha Safari",
      location: "Namibia",
      category: "Luxury Safaris",
      rating: 5,
      reviews: 14,
      price: 85000,
      old_price: 95000,
      days: 8,
      nights: 7,
      guests: 12,
      min_age: 6,
      min_people: 2,
      max_people: 12,
      description:
        "Experience the golden dunes of Sossusvlei, salt pans of Deadvlei and game-rich Etosha National Park on this ultimate Namibia luxury safari.",
      destinations: "Windhoek → Sossusvlei → Etosha → Swakopmund",
      includes: JSON.stringify([
        "Professional guide",
        "Luxury lodge accommodation",
        "All meals",
        "Airport transfers",
        "Park entry fees",
      ]),
      excludes: JSON.stringify([
        "International flights",
        "Visa fees",
        "Travel insurance",
        "Personal items",
      ]),
      highlights: JSON.stringify([
        "Sossusvlei red dunes at sunrise",
        "Deadvlei salt pan",
        "Etosha game drives",
        "Swakopmund coastal town",
      ]),
      available_dates: "Year-round, best Jun–Oct",
      image_url:
        "assets/gallery/etosha-national-park-namibia-wildlife-safari-at-waterhole.jpg",
    },
    {
      title: "Botswana Okavango Fly-In Safari",
      location: "Botswana",
      category: "Fly-In Safaris",
      rating: 5,
      reviews: 22,
      price: 145000,
      old_price: null,
      days: 7,
      nights: 6,
      guests: 8,
      min_age: 6,
      min_people: 2,
      max_people: 8,
      description:
        "Fly directly into the heart of the Okavango Delta, one of Africa's last great wilderness areas, and discover a world of mokoro rides, elephant encounters and extraordinary birdlife.",
      destinations: "Maun → Okavango Delta → Chobe NP → Kasane",
      includes: JSON.stringify([
        "All charter flights within itinerary",
        "Full-board luxury tent lodges",
        "Twice-daily game activities",
        "Park fees",
        "Laundry service",
      ]),
      excludes: JSON.stringify([
        "International flights",
        "Visa fees",
        "Travel insurance",
        "Alcoholic beverages",
      ]),
      highlights: JSON.stringify([
        "Mokoro canoe rides",
        "Walking safaris",
        "Chobe elephant herds",
        "Sunset river cruises",
      ]),
      available_dates: "Apr–Oct (dry season recommended)",
      image_url:
        "assets/gallery/okavango-delta-botswana-wetland-safari-mokoro-excursion.jpg",
    },
    {
      title: "Rwanda Gorilla & Kigali Cultural",
      location: "Rwanda",
      category: "Cross-Border",
      rating: 5,
      reviews: 18,
      price: 120000,
      old_price: 135000,
      days: 6,
      nights: 5,
      guests: 10,
      min_age: 15,
      min_people: 2,
      max_people: 10,
      description:
        "Trek through the misty Volcanoes National Park to spend a magical hour with mountain gorillas, then explore vibrant Kigali and the serene shores of Lake Kivu.",
      destinations: "Kigali → Volcanoes NP → Lake Kivu",
      includes: JSON.stringify([
        "Gorilla trekking permits",
        "Boutique lodge accommodation",
        "All meals",
        "Cultural experiences",
        "Professional gorilla guide",
      ]),
      excludes: JSON.stringify([
        "International flights",
        "Visa fees",
        "Travel insurance",
        "Tips",
      ]),
      highlights: JSON.stringify([
        "Mountain gorilla trekking",
        "Kigali city tour",
        "Lake Kivu sunset",
        "Genocide Memorial visit",
      ]),
      available_dates: "Year-round; best Jun–Sep, Dec–Feb",
      image_url:
        "assets/gallery/volcanoes-national-park-rwanda-gorilla-trekking.jpg",
    },
    {
      title: "Zimbabwe Victoria Falls Adventure",
      location: "Zimbabwe",
      category: "Cross-Border",
      rating: 4,
      reviews: 11,
      price: 98000,
      old_price: null,
      days: 5,
      nights: 4,
      guests: 14,
      min_age: 12,
      min_people: 2,
      max_people: 14,
      description:
        "Stand at the edge of one of the world's Seven Natural Wonders, thrill at Hwange's wildlife and enjoy the best of Zimbabwe's iconic landscapes.",
      destinations: "Harare → Victoria Falls → Hwange NP",
      includes: JSON.stringify([
        "Luxury lodge accommodation",
        "Victoria Falls guided tour",
        "Game drives in Hwange",
        "All meals",
        "Airport transfers",
      ]),
      excludes: JSON.stringify([
        "International flights",
        "Visa fees",
        "Optional activities (e.g. bungee)",
        "Travel insurance",
      ]),
      highlights: JSON.stringify([
        "Victoria Falls walking tour",
        "Hwange elephant encounters",
        "Sunset dinner",
        "Helicopter flight (optional)",
      ]),
      available_dates: "Apr–Dec recommended",
      image_url:
        "assets/gallery/victoria-falls-zimbabwe-waterfall-adventure.webp",
    },
    {
      title: "Kenya Maasai Mara Great Migration",
      location: "Kenya",
      category: "Family Safaris",
      rating: 5,
      reviews: 27,
      price: 110000,
      old_price: 125000,
      days: 7,
      nights: 6,
      guests: 16,
      min_age: 6,
      min_people: 2,
      max_people: 16,
      description:
        "Witness one of nature's greatest spectacles, the Great Wildebeest Migration, in the Maasai Mara, and explore Nairobi's vibrant culture and Amboseli's Kilimanjaro views.",
      destinations: "Nairobi → Amboseli NP → Maasai Mara",
      includes: JSON.stringify([
        "Safari lodge accommodation",
        "All game drives",
        "Maasai village visit",
        "All meals",
        "Park fees",
      ]),
      excludes: JSON.stringify([
        "International flights",
        "Visa fees",
        "Travel insurance",
        "Balloon safari (optional)",
      ]),
      highlights: JSON.stringify([
        "Great Migration river crossings",
        "Big Five encounters",
        "Kilimanjaro backdrop in Amboseli",
        "Maasai cultural experience",
      ]),
      available_dates: "Year-round; migration Jul–Oct",
      image_url: "assets/gallery/maasai-mara-kenya-safari-wildlife.jpg",
    },
    {
      title: "Tanzania Serengeti & Zanzibar Combo",
      location: "Tanzania",
      category: "Self-Drive",
      rating: 4,
      reviews: 19,
      price: 135000,
      old_price: null,
      days: 10,
      nights: 9,
      guests: 8,
      min_age: 6,
      min_people: 2,
      max_people: 8,
      description:
        "Combine the raw wilderness of the Serengeti with the turquoise beaches of Zanzibar for the ultimate African adventure: safari by day, spice island relaxation by night.",
      destinations: "Arusha → Serengeti → Ngorongoro → Zanzibar",
      includes: JSON.stringify([
        "Safari tented camp accommodation",
        "Beach resort (Zanzibar)",
        "All safari meals",
        "Spice tour in Zanzibar",
        "Airport transfers",
      ]),
      excludes: JSON.stringify([
        "International flights",
        "Visa fees",
        "Travel insurance",
        "Diving/snorkelling (optional)",
      ]),
      highlights: JSON.stringify([
        "Serengeti wildlife spectacle",
        "Ngorongoro Crater game drive",
        "Zanzibar Stone Town walk",
        "Pristine Zanzibar beaches",
      ]),
      available_dates: "Year-round; safari best Jun–Oct, Feb–Mar",
      image_url:
        "assets/gallery/serengeti-national-park-tanzania-safari-wildlife.jpg",
    },
  ];

  const seedTours = db.transaction(() => {
    for (const t of TOURS) {
      insertTour.run({ ...t, slug: toSlug(t.title) });
    }
  });
  seedTours();
  console.log(`  ✓ ${TOURS.length} tours inserted`);

  /* ── BLOGS ──────────────────────────────────────────────────── */
  const insertBlog = db.prepare(`
    INSERT INTO blogs (title, slug, tag, excerpt, content, image_url, author, read_time, published_at)
    VALUES (@title, @slug, @tag, @excerpt, @content, @image_url, @author, @read_time, @published_at)
  `);

  const BLOGS = [
    {
      title: "Why Booking Through a Travel Agency Still Matters in 2026",
      tag: "Travel Tips",
      excerpt:
        "Even in 2026, with the rise of travel apps and online booking platforms, using a trusted travel agency remains one of the smartest ways to plan a trip across Africa.",
      content: `<p>Even in 2026, with the rise of travel apps and online booking platforms, using a trusted travel agency remains one of the smartest ways to plan a trip across Africa. While the internet has made it easier than ever to research destinations, booking a complex African itinerary involves far more than clicking a few buttons.</p>

<h3>Expert Knowledge You Can't Google</h3>
<p>At Zusammen Tours, our team has firsthand experience with every destination we sell. We know which lodges are genuinely worth the price, which roads are impassable in the rainy season, and which game areas offer the best wildlife sightings in any given month. No algorithm can replicate that depth of local knowledge.</p>

<h3>Access to Exclusive Rates and Rooms</h3>
<p>We have long-standing relationships with lodges and camps across Namibia, Botswana, Kenya, Rwanda, Tanzania, Uganda, Zambia and Zimbabwe. This means we often access rooms and rates that are not available on public booking platforms, especially during peak migration season when the best camps sell out months in advance.</p>

<h3>One Point of Contact for Everything</h3>
<p>Rather than juggling multiple booking platforms, airlines, insurance providers and activity operators, you have a single dedicated travel specialist handling everything. If a flight is delayed, a lodge floods, or a border crossing closes, we sort it. You just enjoy the trip.</p>

<h3>24/7 Support on the Ground</h3>
<p>Things do occasionally go wrong when you travel in Africa. When they do, having a real person who knows your itinerary and can make calls on your behalf is invaluable. We provide emergency support throughout your trip, something no app can match.</p>

<p>In short: book online for city breaks. For a once-in-a-lifetime African safari, trust the people who live and breathe Africa every day.</p>`,
      image_url:
        "assets/blogs/Why Booking Through a Travel Agency Still Matters in 2026.jpg",
      author: "Zusammen Tours",
      read_time: "5 min read",
      published_at: "2026-01-15T08:00:00",
    },
    {
      title: "Unusual Accommodation Experiences in Africa: Beyond the Ordinary",
      tag: "Accommodation",
      excerpt:
        "From treetop lodges in the Okavango to desert geodesic domes under Namibia's stars, Africa offers accommodation experiences that become part of your travel story.",
      content: `<p>From treetop lodges in the Okavango to desert geodesic domes under Namibia's stars, Africa offers accommodation experiences that become part of your travel story. Forget the standard hotel room. In Africa, where you sleep is as memorable as where you go.</p>

<h3>Sleep Under the Milky Way in the Namib Desert</h3>
<p>Namibia has some of the darkest skies on earth. Geodesic dome camps near Sossusvlei offer transparent ceilings so you can fall asleep watching the Milky Way arc overhead. No light pollution, no noise, just stars and silence stretching to the horizon.</p>

<h3>Treetop Lodges in the Okavango</h3>
<p>Several camps in the Okavango Delta offer treehouse-style accommodation built high in the branches of ancient ebony and fig trees. Wake up to the sound of hippos below and fish eagles calling across the floodplains. In the Okavango, your lodge is part of the ecosystem.</p>

<h3>Floating Houseboats on Lake Kariba</h3>
<p>Zimbabwe and Zambia's Lake Kariba offers an extraordinary experience: spending several nights on a private houseboat, drifting past submerged trees where elephants wade and tiger fish leap. Sundowners on the deck as the sun drops behind the Matusadona hills are genuinely unforgettable.</p>

<p>Africa rewards travellers who look beyond the standard lodge. Ask us about pairing unusual accommodation with your safari and we'll build you something truly one of a kind.</p>`,
      image_url: "assets/blogs/Unusual Accommodation Experiences in Africa.jpg",
      author: "Zusammen Tours",
      read_time: "6 min read",
      published_at: "2026-02-08T08:00:00",
    },
    {
      title:
        "Travelling Solo in Africa: Empowerment, Adventure and Connection",
      tag: "Solo Travel",
      excerpt:
        "There's something uniquely liberating about travelling alone across Africa's diverse nations, from Namibia's vast deserts to Zimbabwe's spectacular waterfalls.",
      content: `<p>There's something uniquely liberating about travelling alone across Africa's diverse nations, from Namibia's vast deserts to Zimbabwe's spectacular waterfalls. Solo travel in Africa is growing fast, and for good reason: the continent rewards independent spirits with extraordinary experiences and genuine human connection.</p>

<h3>Why Africa Is Perfect for Solo Travellers</h3>
<p>Africa's safari culture is naturally communal. When you join a small-group safari, you instantly share incredible moments with like-minded travellers from around the world. The shared experience of watching a lion hunt or a herd of elephants crossing a river creates instant bonds that can last a lifetime.</p>

<h3>The Safest Destinations for Solo Travel</h3>
<p>Namibia consistently ranks among Africa's safest countries for solo travellers, with excellent roads, a stable government, and a welcoming population. Rwanda is another top pick: its reformed security infrastructure, clean cities and community-based tourism make it ideal for solo visitors.</p>

<h3>Tips for Solo Travellers</h3>
<ul>
  <li>Always book reputable, licensed operators, and never accept last-minute deals from strangers</li>
  <li>Share your itinerary with someone at home before you depart</li>
  <li>Purchase comprehensive travel insurance that covers emergency evacuation</li>
  <li>Use a travel agency (like us) that provides a 24/7 emergency contact number</li>
</ul>

<p>Solo travellers often find that Africa opens up in ways it simply doesn't when you're wrapped up in a couple or family bubble. Local guides share more, fellow travellers connect more deeply, and you get to follow the experience that moves you most.</p>`,
      image_url: "assets/blogs/Travelling Solo in Africa.jpg",
      author: "Zusammen Tours",
      read_time: "8 min read",
      published_at: "2026-02-22T08:00:00",
    },
    {
      title:
        "Travel Mistakes to Avoid in Africa (Especially for First-Time Visitors)",
      tag: "Travel Tips",
      excerpt:
        "Africa is a dream destination, but first-time visitors can sometimes make mistakes that impact their trip. Here's what to watch out for and how to avoid it.",
      content: `<p>Africa is a dream destination, but first-time visitors can sometimes make mistakes that impact their trip. Here's what to watch out for, and how a little preparation can make the difference between a good holiday and a life-changing one.</p>

<h3>1. Booking Too Late</h3>
<p>The best lodges in Africa, particularly in the Okavango Delta, Maasai Mara and Rwanda's gorilla zones, book out six to twelve months in advance, especially for peak migration season (July to October). If you're dreaming of a specific destination, start planning now.</p>

<h3>2. Ignoring Travel Insurance</h3>
<p>Medical evacuation from a remote safari camp can cost tens of thousands of dollars. Travel insurance that covers emergency evacuation is not optional in Africa: it is essential. Make sure your policy covers the specific activities on your itinerary.</p>

<h3>3. Packing the Wrong Clothes</h3>
<p>Avoid bright colours, white clothing or camouflage (illegal in some African countries). Safari wear should be neutral: khaki, olive, beige. Evenings in the bush can be surprisingly cold even in summer, so pack layers.</p>

<h3>4. Skipping Health Preparations</h3>
<p>Visit a travel health clinic at least six weeks before departure. Malaria prophylaxis, yellow fever vaccination and updated routine vaccines are all important depending on your destinations.</p>

<p>The best way to avoid all these pitfalls? Work with an experienced travel agency who knows these destinations intimately. That's exactly what we're here for.</p>`,
      image_url: "assets/blogs/Travel Mistakes to Avoid in Africa.jpg",
      author: "Zusammen Tours",
      read_time: "7 min read",
      published_at: "2026-03-01T08:00:00",
    },
    {
      title: "Top Romantic Destinations in Africa for Couples",
      tag: "Romance",
      excerpt:
        "From golden desert dunes in Namibia to gorilla trekking in Rwanda and the sparkling shores of Zanzibar, Africa is extraordinarily romantic for couples.",
      content: `<p>From golden desert dunes in Namibia to gorilla trekking in Rwanda and the sparkling shores of Zanzibar, Africa is extraordinarily romantic for couples. Whether you're celebrating a honeymoon, anniversary, or simply want a trip that feels like nothing else on earth, these destinations deliver.</p>

<h3>Namibia: Drama, Silence and Stars</h3>
<p>Namibia's landscapes are cinematic and intimate at the same time. Imagine watching the sun rise over Sossusvlei's red dunes from your private plunge pool, or lying on your backs counting shooting stars in the Namib Desert with no light pollution for hundreds of kilometres.</p>

<h3>Rwanda: Adventure and Emotion</h3>
<p>Coming face-to-face with a mountain gorilla family is one of the most emotionally profound experiences on earth, and sharing it with your partner creates a bond that is hard to describe. Combine gorilla trekking with a stay at one of Rwanda's extraordinary boutique lodges for the ultimate romantic escape.</p>

<h3>Zanzibar: Beach Paradise</h3>
<p>Zanzibar's powdery white sand, turquoise Indian Ocean waters, and spice-scented Stone Town make it Africa's most romantic beach destination. Combine it with a Serengeti safari for the perfect blend of adventure and relaxation.</p>

<h3>Botswana: Exclusive Wilderness</h3>
<p>The Okavango Delta's exclusive fly-in camps host as few as eight to twelve guests at a time. Sunset mokoro rides, private game drives and dinners under the stars make Botswana's wilderness camps the most romantic in Africa.</p>

<p>Let us design the perfect romantic African itinerary for you and your partner. Every detail, personal and private.</p>`,
      image_url:
        "assets/blogs/Top Romantic Destinations in Africa for Couples.jpg",
      author: "Zusammen Tours",
      read_time: "6 min read",
      published_at: "2026-03-12T08:00:00",
    },
    {
      title:
        "Africa Beyond the Famous: Underrated Spots Every Traveller Should Explore",
      tag: "Destinations",
      excerpt:
        "Beyond Victoria Falls, the Serengeti and the Namib lie hidden gems that few travellers discover, from Damaraland's rock engravings to Zambia's intimate Lower Zambezi.",
      content: `<p>Beyond Victoria Falls, the Serengeti and the Namib lie hidden gems that few travellers discover. Africa's most famous destinations are famous for good reason, but the continent is vast, and its lesser-known corners often offer equally extraordinary experiences with far fewer crowds.</p>

<h3>Damaraland, Namibia</h3>
<p>This remote, rocky wilderness in northwestern Namibia is home to desert-adapted elephants, ancient San rock engravings at Twyfelfontein, and some of the most dramatic landscapes on the continent. Far fewer tourists make it here than to Sossusvlei or Etosha, making it feel truly discovered.</p>

<h3>Lower Zambezi, Zambia</h3>
<p>While South Luangwa gets more attention, the Lower Zambezi National Park offers an equally thrilling safari with the added magic of river-based game viewing. Canoeing past pods of hippos and herds of elephants drinking at the bank is the quintessential Zambian experience.</p>

<h3>Nyungwe Forest, Rwanda</h3>
<p>Most Rwanda itineraries focus on gorillas, but Nyungwe's ancient montane rainforest is a world apart. Chimpanzee tracking, canopy walks above the forest, and extraordinary birding make it one of Africa's most underrated wildlife destinations.</p>

<h3>Caprivi Strip, Namibia</h3>
<p>This narrow corridor in northeastern Namibia, where four countries meet, offers game viewing that rivals the famous destinations, with elephant, buffalo and lion, and almost no other tourists.</p>

<p>Ask us about building an itinerary that goes beyond the famous. Africa's hidden gems are waiting for the travellers bold enough to find them.</p>`,
      image_url:
        "assets/blogs/Africa Beyond the Famous Underrated Spots Every Traveller Should Explore.jpg",
      author: "Zusammen Tours",
      read_time: "9 min read",
      published_at: "2026-03-25T08:00:00",
    },
  ];

  const seedBlogs = db.transaction(() => {
    for (const b of BLOGS) {
      insertBlog.run({ ...b, slug: toSlug(b.title) });
    }
  });
  seedBlogs();
  console.log(`  ✓ ${BLOGS.length} blogs inserted`);

  /* ── FAQS ───────────────────────────────────────────────────── */
  const insertFaq = db.prepare(`
    INSERT INTO faqs (question, answer, sort_order)
    VALUES (@question, @answer, @sort_order)
  `);

  const FAQS = [
    {
      question: "What types of tours or travel packages do you offer?",
      answer:
        "We offer luxury tours in Namibia and 8 other incredible destinations across Africa, including Botswana, Kenya, Rwanda, South Africa, Tanzania, Uganda, Zambia and Zimbabwe. Our tours include adventure, cultural, family-friendly, group and solo travel packages. Many of our trips are fully customisable to match your interests and schedule.",
      sort_order: 1,
    },
    {
      question: "How do I book a tour or package?",
      answer:
        'Booking is simple! You can submit an enquiry online through our website by clicking "SEND REQUEST NOW" on any tour, call our travel specialists directly, or visit our office in Windhoek. Once your booking is confirmed, you\'ll receive all travel details via email.',
      sort_order: 2,
    },
    {
      question: "What is included in the tour/package price?",
      answer:
        "Our packages usually include accommodation, daily meals, airport transfers, guided tours and entry fees to attractions. Optional activities or upgrades may have additional costs, which will always be clearly communicated upfront.",
      sort_order: 3,
    },
    {
      question: "Are there any hidden fees or extra costs?",
      answer:
        "No hidden fees! Any optional activities, tips or special requests will be clearly listed upfront so you can plan your budget with confidence. We believe in complete transparency.",
      sort_order: 4,
    },
    {
      question: "What is your child pricing policy?",
      answer:
        "Children aged 3–12 travel at 60% of the adult rate, making our safaris genuinely family-friendly. Children under 3 travel free of charge (subject to lodge policies). Please note that some tours have minimum age requirements; these are clearly stated on each tour page and are set for safety reasons. Children aged 13 and above are charged at the full adult rate.",
      sort_order: 5,
    },
    {
      question: "What is your cancellation and refund policy?",
      answer:
        "You can cancel or reschedule your trip according to our policy. Cancellations more than 60 days before departure receive a full refund minus a processing fee. Cancellations 30–60 days before departure forfeit 50% of the total cost. Cancellations within 30 days of departure are non-refundable. We strongly recommend travel insurance to cover unexpected cancellations. Full details are on our Terms & Conditions page.",
      sort_order: 6,
    },
    {
      question: "Do I need travel insurance?",
      answer:
        "We strongly recommend comprehensive travel insurance for all our tours. This should cover medical emergencies, emergency evacuation, trip cancellations and lost luggage. Medical evacuation from remote safari areas can be very costly without insurance. Some destinations may require proof of insurance, and our team can advise on the best coverage for your specific itinerary.",
      sort_order: 7,
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept credit and debit cards, bank transfers and secure online payments. For larger trips, instalment plans may also be available. A deposit of 30% secures your booking, with the balance due 60 days before departure. Please speak to our team for details tailored to your booking.",
      sort_order: 8,
    },
    {
      question:
        "Are your tours suitable for families, children or people with special needs?",
      answer:
        "Yes! We have family-friendly packages specifically designed for all ages. Children aged 6 and above are welcome on most of our safaris. Accessibility varies by destination: some remote camps involve walking over uneven terrain, while others offer vehicle-based activities suitable for guests with mobility requirements. Please contact us for personalised assistance.",
      sort_order: 9,
    },
    {
      question:
        "How can I contact you if I need assistance before or during my trip?",
      answer:
        "You can reach us via phone at +264 81 245 5852, by email at info@zusammentravels.com, or through the contact form on our website. For travellers currently on safari, we provide a dedicated 24/7 emergency support line so that help is always available when you need it, wherever you are in Africa.",
      sort_order: 10,
    },
  ];

  const seedFaqs = db.transaction(() => {
    for (const f of FAQS) {
      insertFaq.run(f);
    }
  });
  seedFaqs();
  console.log(`  ✓ ${FAQS.length} FAQs inserted`);

  console.log("\nSeed complete.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
