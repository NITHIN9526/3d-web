// ============================================
// MAIN THREE.JS SCENE
// ============================================
const init = () => {
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;

    // 3. Renderer — cap pixel ratio on mobile for performance
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(
        isMobile
            ? Math.min(window.devicePixelRatio, 1.5)
            : Math.min(window.devicePixelRatio, 2)
    );
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 4. Torus Knot — lower segment count on mobile
    const segments = isMobile ? 100 : 200;
    const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, segments, 32);

    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        wireframe: false
    });

    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Responsive position / scale helper
    const positionObject = () => {
        const w = window.innerWidth;
        if (w <= 768) {
            // Mobile — centered, small
            torusKnot.position.x = 0;
            torusKnot.position.y = 1;
            torusKnot.scale.set(0.65, 0.65, 0.65);
        } else if (w <= 1024) {
            // Tablet — slightly right, medium
            torusKnot.position.x = 1.5;
            torusKnot.position.y = 0;
            torusKnot.scale.set(0.85, 0.85, 0.85);
        } else {
            // Desktop — right, full size
            torusKnot.position.x = 2.5;
            torusKnot.position.y = 0;
            torusKnot.scale.set(1, 1, 1);
        }
    };
    positionObject();

    // 5. Particle system — fewer particles on lower-end devices
    const particlesCount = isMobile ? 300 : isTablet ? 500 : 700;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x8a8a8a,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // 6. Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    const pointLight1 = new THREE.PointLight(0x7b2cbf, 2, 50); // Purple
    pointLight1.position.set(2, 3, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x4361ee, 2, 50); // Blue
    pointLight2.position.set(-2, -3, -4);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0xf72585, 2, 50); // Pink
    pointLight3.position.set(5, 0, 2);
    scene.add(pointLight3);

    // 7. Mouse / Touch parallax
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    const getHalf = () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    document.addEventListener('mousemove', (e) => {
        const half = getHalf();
        mouseX = e.clientX - half.x;
        mouseY = e.clientY - half.y;
    });

    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            const half = getHalf();
            mouseX = (e.touches[0].clientX - half.x) * 2;
            mouseY = (e.touches[0].clientY - half.y) * 2;
        }
    }, { passive: true });

    // 8. Scroll
    let scrollY = window.scrollY;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    // 9. Resize — debounced to avoid jank
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            positionObject();
        }, 150);
    });

    // 10. Animation loop
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Base auto-rotation
        torusKnot.rotation.y += 0.005;
        torusKnot.rotation.x += 0.002;

        // Floating effect — anchored to base Y
        const baseY = window.innerWidth <= 768 ? 1 : 0;
        torusKnot.position.y = baseY + Math.sin(elapsedTime * 0.5) * 0.3;

        // Smooth mouse parallax
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;
        torusKnot.rotation.y += 0.05 * (targetX - torusKnot.rotation.y);
        torusKnot.rotation.x += 0.05 * (targetY - torusKnot.rotation.x);

        // Particle drift
        particlesMesh.rotation.y  = -elapsedTime * 0.05;
        particlesMesh.rotation.x  =  elapsedTime * 0.02;
        particlesMesh.rotation.y +=  targetX * 0.1;

        // Scroll parallax
        camera.position.y          = -scrollY * 0.002;
        torusKnot.rotation.x      +=  scrollY * 0.00002;
        torusKnot.rotation.y      +=  scrollY * 0.00005;

        renderer.render(scene, camera);
    };

    animate();
};

// ============================================
// HAMBURGER MENU
// ============================================
const initHamburger = () => {
    const btn       = document.getElementById('hamburger-btn');
    const mobileNav = document.getElementById('mobile-nav');
    if (!btn || !mobileNav) return;

    const close = () => {
        btn.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
        btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', () => {
        const isOpen = btn.classList.toggle('open');
        mobileNav.classList.toggle('open');
        document.body.style.overflow = isOpen ? 'hidden' : '';
        btn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on any nav link / button click
    mobileNav.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('click', close);
    });

    // Close on outside tap
    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target) && !mobileNav.contains(e.target)) {
            close();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });
};

// ============================================
// BOOT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    init();
    initHamburger();
});
