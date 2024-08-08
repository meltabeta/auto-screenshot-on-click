let capturing = false;
let screenshots = [];
let screenshotVars = [];

// Get elements
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const stopButton = document.getElementById('stop-btn');
const saveButton = document.getElementById('save-btn');
const selectAllButton = document.getElementById('select-all-btn');
const unselectAllButton = document.getElementById('unselect-all-btn');
const viewButton = document.getElementById('view-btn');
const screenshotList = document.getElementById('screenshot-list');
const imgPreview = document.getElementById('img-preview');

startButton.addEventListener('click', startCapturing);
pauseButton.addEventListener('click', pauseCapturing);
stopButton.addEventListener('click', stopCapturing);
saveButton.addEventListener('click', saveSelectedImages);
selectAllButton.addEventListener('click', selectAll);
unselectAllButton.addEventListener('click', unselectAll);
viewButton.addEventListener('click', openImageViewer);

async function startCapturing() {
    capturing = true;
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: false
        });
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack);
        
        setInterval(async () => {
            if (capturing) {
                const bitmap = await imageCapture.grabFrame();
                const canvas = document.createElement('canvas');
                canvas.width = bitmap.width;
                canvas.height = bitmap.height;
                const context = canvas.getContext('2d');
                context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                const screenshot = canvas.toDataURL();
                screenshots.push(screenshot);
                screenshotVars.push(false);
                updateListbox();
            }
        }, 5000); // Capture every 5 seconds
    } catch (err) {
        console.error("Error: " + err);
    }
    console.log("Started capturing");
}

function pauseCapturing() {
    capturing = false;
    console.log("Paused capturing");
}

function stopCapturing() {
    capturing = false;
    console.log("Stopped capturing");
}

function saveSelectedImages() {
    const selectedIndices = screenshotVars.map((selected, index) => selected ? index : -1).filter(index => index !== -1);
    selectedIndices.forEach(index => {
        const link = document.createElement('a');
        link.href = screenshots[index];
        link.download = `screenshot_${Date.now()}_${index}.png`;
        link.click();
    });
    alert(`Saved ${selectedIndices.length} images.`);
}

function updateListbox() {
    screenshotList.innerHTML = '';
    screenshots.forEach((screenshot, index) => {
        const listItem = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'screenshot-checkbox';
        checkbox.addEventListener('change', () => {
            screenshotVars[index] = checkbox.checked;
        });
        listItem.appendChild(checkbox);
        listItem.appendChild(document.createTextNode(` Screenshot ${index + 1}`));
        listItem.addEventListener('click', () => showImage(screenshot));
        screenshotList.appendChild(listItem);
    });
}

function showImage(src) {
    imgPreview.src = src;
    imgPreview.style.display = 'block';
}

function selectAll() {
    document.querySelectorAll('.screenshot-checkbox').forEach((checkbox, index) => {
        checkbox.checked = true;
        screenshotVars[index] = true;
    });
}

function unselectAll() {
    document.querySelectorAll('.screenshot-checkbox').forEach((checkbox, index) => {
        checkbox.checked = false;
        screenshotVars[index] = false;
    });
}

function openImageViewer() {
    const viewer = window.open("", "Captured Images", "width=800,height=600");
    viewer.document.write('<html><head><title>Captured Images</title></head><body><ul id="viewer-listbox"></ul><div id="viewer-img"></div></body></html>');
    const viewerListbox = viewer.document.getElementById('viewer-listbox');
    screenshots.forEach((screenshot, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Screenshot ${index + 1}`;
        listItem.addEventListener('click', () => {
            const viewerImg = viewer.document.getElementById('viewer-img');
            const img = new Image();
            img.src = screenshot;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '400px';
            viewerImg.innerHTML = '';
            viewerImg.appendChild(img);
        });
        viewerListbox.appendChild(listItem);
    });
}
