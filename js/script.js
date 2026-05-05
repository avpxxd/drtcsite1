


try {

/* * =========================================
     * CAROUSEL IMAGE CONFIGURATION
     * =========================================
     * Add or remove image links here. 
     * The code will automatically create slides for them
     * and crop them to fit (object-fit: cover).
     */
    
/*******************************************************
 * CAROUSEL CONFIGURATION
 * Use this array to define the images displayed in the
 * homepage hero carousel.
 *******************************************************/
const carouselImages = [
        "https://images.pexels.com/photos/14553706/pexels-photo-14553706.jpeg",
        "https://images.pexels.com/photos/15109652/pexels-photo-15109652.jpeg",
        "https://images.pexels.com/photos/159304/network-cable-ethernet-computer-159304.jpeg"
    ];

    /* ================= NAVBAR SCROLL LOGIC ================= */
    (() => {
        const navbar = document.getElementById("navbar");
        let lastY = window.scrollY;
        let ticking = false;
        const THRESH = 10;

        function update() {
            const y = window.scrollY;
            const diff = y - lastY;

            // Always show if near top
            if (y <= 10) {
                navbar.classList.remove("isHidden");
            } 
            // Hide if scrolling down significantly
            else if (diff > THRESH) {
                navbar.classList.add("isHidden");
            } 
            // Show if scrolling up significantly
            else if (diff < -THRESH) {
                navbar.classList.remove("isHidden");
            }

            lastY = y;
            ticking = false;
        }

        window.addEventListener("scroll", () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    })();

    /* ================= MOBILE MENU LOGIC ================= */
    (() => {
        const hamburger = document.getElementById("hamburger");
        const navLinks = document.getElementById("navLinks");
        const navbar = document.getElementById("navbar");
        
        // toggle main menu
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            const isActive = hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isActive);
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains("active")) {
                hamburger.classList.remove("active");
                navLinks.classList.remove("active");
                hamburger.setAttribute("aria-expanded", false);
            }
        });

        // ================= DROPDOWN HANDLING ================= //
        
        // 1. Handle Top-Level Dropdowns (Services)
        const dropdownToggles = document.querySelectorAll('.hasDropdown > .navLinkBtn');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                // Only intercept click on mobile (< 640px)
                if (window.innerWidth <= 640) {
                    e.preventDefault(); // Prevent navigation/hash jump
                    const parent = toggle.parentElement;
                    
                    // Close other open dropdowns (optional - accordion style)
                    document.querySelectorAll('.navItem.hasDropdown.open').forEach(item => {
                        if (item !== parent) item.classList.remove('open');
                    });

                    parent.classList.toggle('open');
                }
            });
        });

        // 2. Handle Nested Submenus (Marketing -> SEO)
        const subMenuToggles = document.querySelectorAll('.hasSubmenu > .mainBtn');
        
        subMenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                // Intercept clicks on both mobile and desktop (since this is a button, not a link)
                // If it were a link, we'd check window width like above
                e.preventDefault();
                e.stopPropagation(); // Prevent bubbling to parent dropdown
                
                const parent = toggle.parentElement;
                parent.classList.toggle('open');
            });
        });

    })();

    /* ================= CAROUSEL LOGIC ================= */
    (() => {
        const container = document.getElementById('carouselContainer');
        const intervalTime = 5000; // 5 seconds
        let slides = [];
        let currentSlide = 0;

        // 1. Initialize Slides from Config Array
        function initCarousel() {
            // Clear any existing slides (except overlay/content which are separate or we append)
            // Note: overlay/content are already in HTML, we just want to append slides.
            
            carouselImages.forEach((url, index) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
                
                const img = document.createElement('img');
                img.src = url;
                img.alt = "Slide Image"; // Decorative background
                
                slideDiv.appendChild(img);
                container.appendChild(slideDiv);
            });

            // Get references to the newly created slides
            slides = document.querySelectorAll('.carousel-slide');
        }

        // 2. Start Animation Loop
        
    /*******************************************************
     * ANIMATION LOGIC
     * Core function moving the carousel to the next frame.
     *******************************************************/
    function nextSlide() {
            if (slides.length === 0) return;

            // Remove active class from current
            slides[currentSlide].classList.remove('active');
            
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (carouselImages.length > 0) {
            initCarousel();
            if (!prefersReducedMotion) {
                setInterval(nextSlide, intervalTime);
            }
        }
    })();

    /* ================= REVIEWS AUTO-SCROLL (grab to drag) ================= */
    (() => {
        const viewport = document.getElementById('reviewsViewport');
        const track = document.getElementById('reviewsTrack');
        if (!viewport || !track) return;

        const CARD_WIDTH = 350;
        const GAP = 30;
        const STEP = CARD_WIDTH + GAP;
        const CARDS_PER_SET = 5;
        const SET_WIDTH = CARDS_PER_SET * STEP;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const SPEED = 45;

        let position = 0;
        let dragging = false;
        let dragStartX = 0;
        let dragStartPosition = 0;
        let rafId = null;
        let lastTime = 0;

        function wrapPosition(p) {
            while (p >= SET_WIDTH) p -= SET_WIDTH;
            while (p < 0) p += SET_WIDTH;
            return p;
        }

        function setTrackPosition(px) {
            track.style.transform = `translateX(-${px}px)`;
        }

        function tick(now) {
            if (!lastTime) lastTime = now;
            const dt = (now - lastTime) / 1000;
            lastTime = now;
            if (!dragging && !prefersReducedMotion) {
                position += SPEED * dt;
                if (position >= SET_WIDTH) position -= SET_WIDTH;
                setTrackPosition(position);
            }
            rafId = requestAnimationFrame(tick);
        }

        function onPointerDown(e) {
            if (e.button !== 0 && e.type === 'mousedown') return;
            dragging = true;
            track.classList.add('is-dragging');
            dragStartX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
            dragStartPosition = position;
            viewport.setPointerCapture?.(e.pointerId);
            e.preventDefault();
        }

        function onPointerMove(e) {
            if (!dragging) return;
            const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
            position = dragStartPosition + (dragStartX - clientX);
            setTrackPosition(position);
        }

        function onPointerUp(e) {
            if (e.type === 'mouseup' && e.button !== 0) return;
            dragging = false;
            track.classList.remove('is-dragging');
            position = wrapPosition(position);
            setTrackPosition(position);
            viewport.releasePointerCapture?.(e.pointerId);
        }

        viewport.addEventListener('pointerdown', onPointerDown, { passive: false });
        viewport.addEventListener('pointermove', onPointerMove, { passive: true });
        viewport.addEventListener('pointerup', onPointerUp, { passive: true });
        viewport.addEventListener('pointerleave', onPointerUp, { passive: true });
        viewport.addEventListener('pointercancel', onPointerUp, { passive: true });

        setTrackPosition(0);
        rafId = requestAnimationFrame(tick);
    })();

    /* ================= SCROLL ANIMATIONS ================= */
    (() => {
        const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    })();

} catch (e) { console.warn('Ignored error in script block from index.html:', e); }


try {

/* ================= NAVBAR SCROLL LOGIC ================= */
    (() => {
        const navbar = document.getElementById("navbar");
        let lastY = window.scrollY;
        let ticking = false;
        const THRESH = 10;

        function update() {
            const y = window.scrollY;
            const diff = y - lastY;

            // Always show if near top
            if (y <= 10) {
                navbar.classList.remove("isHidden");
            } 
            // Hide if scrolling down significantly
            else if (diff > THRESH) {
                navbar.classList.add("isHidden");
            } 
            // Show if scrolling up significantly
            else if (diff < -THRESH) {
                navbar.classList.remove("isHidden");
            }

            lastY = y;
            ticking = false;
        }

        window.addEventListener("scroll", () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    })();

    /* ================= MOBILE MENU LOGIC ================= */
    (() => {
        const hamburger = document.getElementById("hamburger");
        const navLinks = document.getElementById("navLinks");
        const navbar = document.getElementById("navbar");
        
        // toggle main menu
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            const isActive = hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isActive);
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains("active")) {
                hamburger.classList.remove("active");
                navLinks.classList.remove("active");
                hamburger.setAttribute("aria-expanded", false);
            }
        });

        // ================= DROPDOWN HANDLING ================= //
        
        // 1. Handle Top-Level Dropdowns (Services)
        const dropdownToggles = document.querySelectorAll('.hasDropdown > .navLinkBtn');
        
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                // Only intercept click on mobile (< 640px)
                if (window.innerWidth <= 640) {
                    e.preventDefault(); // Prevent navigation/hash jump
                    const parent = toggle.parentElement;
                    
                    // Close other open dropdowns
                    document.querySelectorAll('.navItem.hasDropdown.open').forEach(item => {
                        if (item !== parent) item.classList.remove('open');
                    });

                    parent.classList.toggle('open');
                }
            });
        });

        // 2. Handle Nested Submenus
        const subMenuToggles = document.querySelectorAll('.hasSubmenu > .mainBtn');
        
        subMenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevent bubbling to parent dropdown
                
                const parent = toggle.parentElement;
                parent.classList.toggle('open');
            });
        });

    })();

    /* ================= SCROLL ANIMATIONS & COUNTERS ================= */
    (() => {
        const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    
                    // Trigger counters if this element has them
                    const counters = entry.target.querySelectorAll('.stat-num');
                    counters.forEach(counter => {
                        if (!counter.classList.contains('counted')) {
                            counter.classList.add('counted');
                            const target = +counter.getAttribute('data-target');
                            const duration = 2000;
                            const step = target / (duration / 16);
                            let current = 0;
                            
                            const updateCounter = () => {
                                current += step;
                                if (current < target) {
                                    counter.innerText = Math.ceil(current);
                                    requestAnimationFrame(updateCounter);
                                } else {
                                    counter.innerText = target;
                                }
                            };
                            updateCounter();
                        }
                    });
                    
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    })();

} catch (e) { console.warn('Ignored error in script block from about.html:', e); }


try {

/* ================= NAVBAR LOGIC ================= */
    (() => {
        const navbar = document.getElementById("navbar");
        let lastY = window.scrollY;
        let ticking = false;
        const THRESH = 10;

        function update() {
            const y = window.scrollY;
            const diff = y - lastY;
            if (y <= 10) navbar.classList.remove("isHidden");
            else if (diff > 10) navbar.classList.add("isHidden");
            else if (diff < -10) navbar.classList.remove("isHidden");
            lastY = y;
            ticking = false;
        }

        window.addEventListener("scroll", () => {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    })();

    /* ================= MOBILE MENU LOGIC ================= */
    (() => {
        const hamburger = document.getElementById("hamburger");
        const navLinks = document.getElementById("navLinks");
        const navbar = document.getElementById("navbar");
        
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            const isActive = hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isActive);
        });

        document.addEventListener("click", (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains("active")) {
                hamburger.classList.remove("active");
                navLinks.classList.remove("active");
                hamburger.setAttribute("aria-expanded", false);
            }
        });

        // 1. Handle Top-Level Dropdowns
        document.querySelectorAll('.hasDropdown > .navLinkBtn').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 640) {
                    e.preventDefault();
                    const parent = toggle.parentElement;
                    document.querySelectorAll('.navItem.hasDropdown.open').forEach(item => {
                        if (item !== parent) item.classList.remove('open');
                    });
                    parent.classList.toggle('open');
                }
            });
        });

        // 2. Handle Nested Submenus
        document.querySelectorAll('.hasSubmenu > .mainBtn').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const parent = toggle.parentElement;
                parent.classList.toggle('open');
            });
        });
    })();

} catch (e) { console.warn('Ignored error in script block from contact.html:', e); }


try {

// --- SERVICE DATA CONSOLIDATION ---
        const serviceData = {
        'web-development': {
            category: 'Digital Services',
            title: 'Web Development',
            tags: ['Discovery & UX', 'Responsive Build', 'CMS & Integrations'],
            desc: 'We build professional websites and custom web solutions that help businesses present their brand clearly, convert more visitors, and support day-to-day operations with reliable performance.',
            keyPoints: [
                'Clear planning around user experience and calls to action.',
                'Mobile-friendly builds with strong performance and accessibility.',
                'Support for forms, content management, and integrations.'
            ],
            highlights: [
                { label: 'Project Types', val: 'Business websites, landing pages, and custom portals', desc: 'Designed to look credible and guide visitors toward the right next step.' },
                { label: 'Business Focus', val: 'Lead generation, trust, and usability', desc: 'We keep the build practical and aligned with your operations.' }
            ],
            included: ['Discovery & planning', 'Custom layouts', 'Basic SEO & Analytics'],
            extraLabel: 'Best Fit For',
            extraList: ['Outdated online presences', 'Teams needing more than a basic builder', 'Scalable growth sites'],
            ctaTitle: 'Planning a new website?',
            ctaDesc: 'We can help you scope the right structure and features before dev begins.'
        },
        'infrastructure-hosting': {
            category: 'Digital Services',
            title: 'Infrastructure Hosting',
            tags: ['Flexible Resources', 'Windows & Linux', '24/7 Monitoring'],
            desc: 'Managed hosting solutions designed for flexibility and dependability. We provide responsive customer support and rigorous 24/7 monitoring to ensure your business systems are always available.',
            keyPoints: [
                'Support for both Windows and Linux hosting environments.',
                'Flexible resource management tailored to your specific application workloads.',
                'Proactive 24/7 monitoring to catch and resolve issues early.'
            ],
            highlights: [
                { label: 'Platform Flexibility', val: 'Windows Server, Linux Distributions', desc: 'Deployed correctly the first time to match your app requirements.' },
                { label: 'Confidence', val: '24/7 Monitoring & Responsive Support', desc: 'Live alerts and rapid response to keep critical infrastructure online.' }
            ],
            included: ['Environment setup', 'Resource allocation', 'Continuous monitoring'],
            extraLabel: 'Best Fit For',
            extraList: ['Businesses looking to migrate to robust servers', 'Companies requiring specific OS environments', 'Scaling web applications'],
            ctaTitle: 'Ready to upgrade your hosting?',
            ctaDesc: 'We can review your needs and design a resilient, monitored environment.'
        },
        'server-configuration': {
            category: 'Digital Services',
            title: 'Server Configuration',
            tags: ['Custom Deployments', 'Windows & Linux', 'Security Focused'],
            desc: 'Expertly configured server environments built natively around your software footprint. Whether you need a Windows domain controller or a Linux web stack, we engineer for stability, security, and responsive performance.',
            keyPoints: [
                'Deployment and administration of Windows and Linux servers.',
                'Proactive resource balancing and scaling preparation.',
                'Focus on hardening environments against vulnerabilities.'
            ],
            highlights: [
                { label: 'Capabilities', val: 'On-Premise & Cloud Infrastructure', desc: 'We configure settings specifically to your intended use-cases.' },
                { label: 'Maintenance', val: 'Responsive customer support & 24/7 tracking', desc: 'We stand by what we build with ongoing assistance.' }
            ],
            included: ['Role/Feature installation', 'Security baselines', 'Active threat monitoring setups'],
            extraLabel: 'Best Fit For',
            extraList: ['Companies upgrading their internal network architecture', 'Software teams requiring specific dependencies', 'Regulated industries needing strict server security'],
            ctaTitle: 'Need a server engineered for your exact workload?',
            ctaDesc: 'Let us build a dependable backbone for your data and applications.'
        },
        'pc-building': {
            category: 'Residential Services',
            title: 'PC Planning & Building',
            tags: ['Gaming & Office', 'Childrens Basics', 'Custom Rigs'],
            desc: 'From high-end gaming rigs and professional office workstations to simple, cost-effective devices designed for children. We custom plan, component-match, and assemble PCs precisely to your requirements.',
            keyPoints: [
                'Extensive planning based on actual software/game needs and budget.',
                'Clean, professional assembly ensuring optimal thermal limits and airflow.',
                'Turnaround times communicated upfront based on part availability.'
            ],
            highlights: [
                { label: 'Versatility', val: 'Office, High-End Gaming, Basic Devices', desc: 'We do not oversell—we build what the user actually needs.' },
                { label: 'Pricing', val: '100% Custom Quoted', desc: 'Pricing determined honestly by required parts, resources, and custom labor.' }
            ],
            included: ['Consultation & component selection', 'Cable-managed assembly', 'OS installation & burn-in testing'],
            extraLabel: 'Best Fit For',
            extraList: ['Gamers looking for maximum framerates', 'Professionals needing heavy workstation power', 'Parents buying first-time PCs for kids'],
            ctaTitle: 'Looking to build your ideal machine?',
            ctaDesc: 'Tell us what you want to do with it, and we will handle the rest.'
        },
        'hardware-support': {
            category: 'Residential Services',
            title: 'Hardware Support & Repair',
            tags: ['PC & Console Repair', 'Diagnostic Testing', 'Upgrades'],
            desc: 'Accurate diagnostics and effective hardware repairs for office machines, gaming PCs, kids devices, and even gaming consoles. We assess the severity of the damage to give you transparent turnaround times.',
            keyPoints: [
                'Comprehensive support for desktops, laptops, and game consoles.',
                'Custom labor pricing based solely on the severity of the repair.',
                'Transparent communication regarding timelines and part ordering.'
            ],
            highlights: [
                { label: 'Repair Scope', val: 'Components, Screens, Consoles', desc: 'We take on a massive variety of hardware restoration jobs.' },
                { label: 'Expectations', val: 'Variable Turnaround', desc: 'Length of the repair depends on the complexity of the fix and part availability.' }
            ],
            included: ['Deep diagnostic testing', 'Part sourcing/replacement', 'Post-repair system stress testing'],
            extraLabel: 'Best Fit For',
            extraList: ['Broken screens or failing hard drives', 'Overheating or dead game consoles', 'Preventative maintenance & dusting'],
            ctaTitle: 'Device acting up?',
            ctaDesc: 'Let us diagnose the hardware issue and provide a fair quote for restoration.'
        },
        'software-support': {
            category: 'Residential Services',
            title: 'Software Support',
            tags: ['OS Reinstalls', 'Troubleshooting', 'App Configurations'],
            desc: 'Professional software assistance spanning everything from operating system errors and virus removal to specialized productivity application configuration. We solve the issues slowing down your daily workflow.',
            keyPoints: [
                'Malware and virus identification and clean removal.',
                'Corrupted operating system repair and fresh installs.',
                'Pricing structured cleanly around the labor required for the specific fix.'
            ],
            highlights: [
                { label: 'Coverage', val: 'Windows, Productivity Suites, Gaming Clients', desc: 'We resolve conflicts across the software spectrum.' },
                { label: 'Pricing', val: 'Custom quoted labor', desc: 'You never pay a blanket fee for a simple fix.' }
            ],
            included: ['Error logging review', 'Software re-initializations', 'Driver updates'],
            extraLabel: 'Best Fit For',
            extraList: ['Blue screen of death (BSOD) loops', 'Slow, bogged-down operating systems', 'Data recovery or OS migrations'],
            ctaTitle: 'Need help untangling a software mess?',
            ctaDesc: 'Reach out to our team, and we will get your systems running smoothly again.'
        },
        'enterprise-networking': {
            category: 'Networking',
            title: 'Enterprise Networking',
            tags: ['Ubiquiti & Cisco', 'Custom Topologies', 'Robust Wi-Fi'],
            desc: 'Secure, cleanly segmented network deployments using professional gear. We primarily work with UniFi and Cisco hardware to guarantee consistent, business-grade connections across your entire footprint.',
            keyPoints: [
                'Primary deployments handled confidently using UniFi and Cisco systems.',
                'We also actively work with and configure user-supplied networking machinery.',
                'Complete layout mapping for consistent Wi-Fi spread and wired stability.'
            ],
            highlights: [
                { label: 'Brand Expertise', val: 'UniFi & Cisco', desc: 'We deploy the standard bearers of modern enterprise infrastructure.' },
                { label: 'Flexibility', val: 'User-Supplied Integration', desc: 'Bought your own gear? We can configure and deploy it properly for you.' }
            ],
            included: ['Network segmentation/VLANs', 'Physical AP mounting', 'Security and firewall rule generation'],
            extraLabel: 'Best Fit For',
            extraList: ['Offices with dead zones', 'Businesses requiring secure guest networks', 'Locations transitioning to fiber'],
            ctaTitle: 'Ready for enterprise-grade connectivity?',
            ctaDesc: 'We will design a network topology that removes bottlenecks and drops.'
        },
        'home-networking': {
            category: 'Networking',
            title: 'Home Networking',
            tags: ['Mesh Systems', 'UniFi Deployments', 'Smart Home Integration'],
            desc: 'Powerful residential Wi-Fi and hardwired networking. From large property UniFi deployments to setting up customer-supplied routers, we work to fit your budget and deliver dead-zone-free connections.',
            keyPoints: [
                'Expertise installing robust residential UniFi ecosystems.',
                'Happy to install and configure hardware that you have already purchased.',
                'Pricing tailored entirely to the scale of layout and labor required.'
            ],
            highlights: [
                { label: 'Outcome', val: 'Consistent Wi-Fi Coverage', desc: 'Say goodbye to dropped connections on the opposite side of the house.' },
                { label: 'Approach', val: 'Budget-conscious architecture', desc: 'We do our best to map networks that fit realistically within your wallet.' }
            ],
            included: ['Router & switch setup', 'Wireless Access Point testing', 'Smart home bridging'],
            extraLabel: 'Best Fit For',
            extraList: ['Large homes suffering from weak ISP routers', 'Backyard/Garage Wi-Fi extensions', 'Hardwiring home offices or entertainment centers'],
            ctaTitle: 'Tired of buffering?',
            ctaDesc: 'Let us build a home network that finally handles your streaming and gaming needs.'
        },
        'voip-setup': {
            category: 'Networking',
            title: 'VoIP Setup & Installation',
            tags: ['3CX Yealink', 'Polycom & Cisco', 'Budget-Conscious'],
            desc: 'Modernize your communications. We deploy and configure major VoIP brands like 3CX Yealink, Polycom, and Cisco, ensuring consistent call quality over robust wireless or hardwired networks.',
            keyPoints: [
                'Specialized experience with 3CX Yealink, Polycom, and Cisco systems.',
                'Configuring handsets to maintain consistent, clear connections—even via Wi-Fi.',
                'Designing call flows and setups that actively respect and fit your budget.'
            ],
            highlights: [
                { label: 'Hardware Integrations', val: '3CX Yealink, Polycom, Cisco', desc: 'Deploying the best devices in the VoIP industry.' },
                { label: 'Connectivity', val: 'Consistent Wireless VoIP', desc: 'We structure the network so your Wi-Fi handsets ring clearly every time.' }
            ],
            included: ['Handset provisioning', 'Call routing/flow design', 'Network prioritization for voice traffic'],
            extraLabel: 'Best Fit For',
            extraList: ['Offices replacing legacy landlines', 'Call centers requiring complex routing', 'Remote teams utilizing softphones'],
            ctaTitle: 'Looking to modernize your phones?',
            ctaDesc: 'Get in touch for a custom VoIP mapping strategy and hardware quote.'
        }
    };

/*******************************************************
 * SERVICE PANELS (MODALS)
 * Logic for opening and closing the slide-out service
 * description panels on the Services page.
 *******************************************************/
window.openPanel = function(id) {
        const data = serviceData[id];
        if (!data) return;
                let buttonsHtml = '';
        if (id === 'voip-setup') {
            buttonsHtml = `<a href="../../pages/company/request-a-quote.html" class="primary-btn">Request a Quote</a>
                           <a href="../../pages/company/contact.html" class="primary-btn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">Contact Us</a>`;
        } else if (data.category.includes('Business') || data.category.includes('Digital') || data.category.includes('Enterprise') || id === 'enterprise-networking') {
            buttonsHtml = `<a href="../../pages/company/request-a-quote.html" class="primary-btn">Request a Quote</a>`;
        } else {
            buttonsHtml = `<a href="../../pages/company/contact.html" class="primary-btn">Contact Us</a>`;
        }

        history.replaceState(null, '', '?open=' + id);
        const content = `
            <div class="panel-category">${data.category}</div>
            <h2 class="panel-title">${data.title}</h2>
            <div class="panel-tags">
                ${data.tags.map(t => `<span class="panel-tag">${t}</span>`).join('')}
            </div>
            <p class="panel-desc">${data.desc}</p>
            <ul class="panel-list">
                ${data.keyPoints.map(p => `<li>${p}</li>`).join('')}
            </ul>
            
            <div class="panel-highlight-grid">
                ${data.highlights.map(h => `
                    <div class="panel-highlight">
                        <span class="panel-highlight-label">${h.label}</span>
                        <strong class="panel-highlight-value">${h.val}</strong>
                        <p class="panel-highlight-desc">${h.desc}</p>
                    </div>
                `).join('')}
            </div>

            <h3 class="panel-section-title">What's Included</h3>
            <ul class="panel-list">
                ${data.included.map(i => `<li>${i}</li>`).join('')}
            </ul>

            <h3 class="panel-section-title">${data.extraLabel}</h3>
            <ul class="panel-list">
                ${data.extraList.map(e => `<li>${e}</li>`).join('')}
            </ul>

                                    <div class="panel-cta-box">
                <h4>${data.ctaTitle}</h4>
                <p>${data.ctaDesc}</p>
                <div style="display: flex; justify-content: center; gap: 12px; margin-top: 20px;">
                    ${buttonsHtml}
                </div>
            </div>
        `;
        document.getElementById('panel-content').innerHTML = content;
        document.getElementById('service-panel').classList.add('active');
        document.getElementById('panel-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    window.closePanel = function() {
        document.getElementById('service-panel').classList.remove('active');
        document.getElementById('panel-overlay').classList.remove('active');
        document.body.style.overflow = 'auto';
        history.replaceState(null, '', window.location.pathname);
    }

    // Auto-open panel from URL param (e.g. services.html?open=web-development)
    // Delay 1s so the page has time to render before the panel slides in
    const _autoOpen = new URLSearchParams(window.location.search).get('open');
    if (_autoOpen && serviceData[_autoOpen]) setTimeout(() => openPanel(_autoOpen), 1000);

    // --- ANIMATIONS & NAVBAR LOGIC ---
    /* ================= NAVBAR SCROLL LOGIC ================= */
    (() => {
        const navbar = document.getElementById("navbar");
        let lastY = window.scrollY;
        let ticking = false;
        const THRESH = 10;

        function update() {
            const y = window.scrollY;
            const diff = y - lastY;
            if (y <= 10) {
                navbar.classList.remove("isHidden");
            } else if (diff > THRESH) {
                navbar.classList.add("isHidden");
            } else if (diff < -THRESH) {
                navbar.classList.remove("isHidden");
            }
            lastY = y;
            ticking = false;
        }

        window.addEventListener("scroll", () => {
            if (!ticking) { requestAnimationFrame(update); ticking = true; }
        }, { passive: true });
    })();

    /* ================= MOBILE MENU LOGIC ================= */
    (() => {
        const hamburger = document.getElementById("hamburger");
        const navLinks = document.getElementById("navLinks");
        const navbar = document.getElementById("navbar");

        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            const isActive = hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
            hamburger.setAttribute("aria-expanded", isActive);
        });

        document.addEventListener("click", (e) => {
            if (!navbar.contains(e.target) && navLinks.classList.contains("active")) {
                hamburger.classList.remove("active");
                navLinks.classList.remove("active");
                hamburger.setAttribute("aria-expanded", false);
            }
        });

        const dropdownToggles = document.querySelectorAll('.hasDropdown > .navLinkBtn');
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                if (window.innerWidth <= 640) {
                    e.preventDefault();
                    const parent = toggle.parentElement;
                    document.querySelectorAll('.navItem.hasDropdown.open').forEach(item => {
                        if (item !== parent) item.classList.remove('open');
                    });
                    parent.classList.toggle('open');
                }
            });
        });

        const subMenuToggles = document.querySelectorAll('.hasSubmenu > .mainBtn');
        subMenuToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const parent = toggle.parentElement;
                parent.classList.toggle('open');
            });
        });
    })();

    /* ================= SCROLL ANIMATIONS ================= */
    (() => {
        const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    })();

} catch (e) { console.warn('Ignored error in script block from services.html:', e); }
