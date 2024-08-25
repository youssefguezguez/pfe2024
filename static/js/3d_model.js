let scene, camera, renderer, hannibalModel, mixer, directionalLight, pointLight;
let logInterval;

function init() {
    const container = document.getElementById('3d-container');

    // Set up the scene
    scene = new THREE.Scene();

    // Set up the camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 3, 9.4);
    camera.lookAt(0, -1, 0);

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    scene.add(ambientLight);

    // Add directional light
    directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(0, 5, 15);
    scene.add(directionalLight);

    // **Add point light**
    pointLight = new THREE.PointLight(0xffffff, 1.5, 100); // Color, Intensity, Distance
    pointLight.position.set(0, -3, 8); // Position the light to face the model
    scene.add(pointLight);

    // Load the model
    loadModel();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start rendering loop
    render();

    // Set up logging every 10 seconds
    logInterval = setInterval(logPositions, 10000);

    // Prompt user for input every 10 seconds
    setInterval(promptUserInput, 10000);
}

function loadModel() {
    const loader = new THREE.GLTFLoader();

    // Correctly set up the DracoLoader
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);

    // Load the GLTF model
    loader.load('/static/models/untitled.glb', 
        (gltf) => {
            hannibalModel = gltf.scene;
            scene.add(hannibalModel);

            // Center and scale the model
            centerAndScaleModel(hannibalModel);

            hannibalModel.position.set(0, -5.5, 4);

            // Log model position
            console.log('Model position:', hannibalModel.position);

            // Set up animation mixer
            mixer = new THREE.AnimationMixer(hannibalModel);
            const clips = gltf.animations;
            if (clips.length > 0) {
                mixer.clipAction(clips[0]).play();
            }
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error('An error occurred while loading the model:', error);
        }
    );
}

function centerAndScaleModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    model.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 10 / maxDim;
    model.scale.multiplyScalar(scale);
}

function render() {
    requestAnimationFrame(render);

    if (mixer) {
        mixer.update(0.01); // Update the animation mixer
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('3d-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}


document.addEventListener('DOMContentLoaded', init);
