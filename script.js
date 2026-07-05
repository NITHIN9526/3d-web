// Main Three.js setup
const init = () => {
    // 1. Scene setup
    const scene = new THREE.Scene();
    
    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // 4. Create the 3D object (a complex Torus Knot for abstract, sleek look)
    // We use a TorusKnotGeometry with many segments for a smooth appearance
    const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 200, 32);
    
    // Create a custom material that looks premium and glassy/metallic
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
    // Position it to the right side of the screen
    torusKnot.position.x = window.innerWidth > 768 ? 2.5 : 0;
    scene.add(torusKnot);
    
    // Let's add a particle system around it for extra 'wow' factor
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 700;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        // Spread particles around
        posArray[i] = (Math.random() - 0.5) * 15;
    }
    
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
    
    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    // Colored point lights to create a gradient effect on the object
    const pointLight1 = new THREE.PointLight(0x7b2cbf, 2, 50); // Purple
    pointLight1.position.set(2, 3, 4);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x4361ee, 2, 50); // Blue
    pointLight2.position.set(-2, -3, -4);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0xf72585, 2, 50); // Pink
    pointLight3.position.set(5, 0, 2);
    scene.add(pointLight3);
    
    // 6. Interaction - Mouse Movement
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });
    
    // Scroll Event
    let scrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });
    
    // 7. Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Update object position based on screen size
        torusKnot.position.x = window.innerWidth > 768 ? 2.5 : 0;
    });
    
    // 8. Animation Loop
    const clock = new THREE.Clock();
    
    const animate = () => {
        requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        
        // Base rotation
        torusKnot.rotation.y += 0.005;
        torusKnot.rotation.x += 0.002;
        
        // Float effect
        torusKnot.position.y = Math.sin(elapsedTime * 0.5) * 0.3;
        
        // Smoothly move object towards mouse position for parallax
        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;
        
        torusKnot.rotation.y += 0.05 * (targetX - torusKnot.rotation.y);
        torusKnot.rotation.x += 0.05 * (targetY - torusKnot.rotation.x);
        
        // Rotate particles slowly
        particlesMesh.rotation.y = -elapsedTime * 0.05;
        particlesMesh.rotation.x = elapsedTime * 0.02;
        
        // Also move particles slightly with mouse
        particlesMesh.rotation.y += targetX * 0.1;
        
        // --- Parallax Scroll Effect ---
        // Adjust camera position based on scroll to create a 3D parallax scroll effect
        // Negative so that when we scroll down (positive scrollY), camera moves down
        camera.position.y = -scrollY * 0.002;
        
        // Also add some rotation to the torus knot based on scroll
        torusKnot.rotation.x += scrollY * 0.00002;
        torusKnot.rotation.y += scrollY * 0.00005;
        
        // Render
        renderer.render(scene, camera);
    };
    
    animate();
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
