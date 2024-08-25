let scene, camera, renderer, hannibalModel;

function init() {
    const container = document.getElementById('3d-container');

    // Set up the scene
    scene = new THREE.Scene();

    // Set up the camera
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    // Set up the renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add spotlight
    const spotlight = new THREE.SpotLight(0xffffff, 1.5);
    spotlight.position.set(0, 10, 10);
    spotlight.angle = Math.PI / 4;
    spotlight.penumbra = 0.5;
    spotlight.castShadow = true;
    scene.add(spotlight);

    // Load the model
    loadModel();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

function loadModel() {
    const loader = new THREE.GLTFLoader();

    // Correctly set up the DracoLoader
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);

    // Load the GLTF model
    loader.load('/static/models/hannibalbarca.glb', 
        (gltf) => {
            hannibalModel = gltf.scene;
            scene.add(hannibalModel);

            centerAndScaleModel(hannibalModel);

            // Rotate the model to face the camera
            hannibalModel.rotation.y = Math.PI;
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

function animate() {
    requestAnimationFrame(animate);

    if (hannibalModel) {
        hannibalModel.rotation.y += 0.005;
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
