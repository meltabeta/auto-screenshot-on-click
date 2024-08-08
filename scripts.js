let capturing = false;
let screenshots = [];
let screenshotVars = [];

// Get elements
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const stopButton = document.getElementById('stop-btn');
const captureButton = document.getElementById('capture-btn');
const saveButton = document.getElementById('save-btn');
const selectAllButton = document.getElementById('select-all-btn');
const unselectAllButton = document.getElementById('unselect-all-btn');
const viewButton = document.getElementById('view-btn');
const screenshotList = document.getElementById('screenshot-list');
const imgPreview = document.getElementById('img-preview');

startButton.addEventListener('click', startCapturing);
pauseButton.addEventListener('click', pauseCapturing);
stopButton.addEventListener('click', stopCapturing);
captureButton.addEventListener('click', captureScreenshot);
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
                await captureFrame(imageCapture);
            }
        }, 5000); // Capture every 5 seconds
    } catch (err) {
        console.error("Error: " + err);
    }
    console.log("Started capturing");
}

async function captureScreenshot() {
    capturing = true;
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { cursor: "always" },
            audio: false
        });
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack);
        await captureFrame(imageCapture);
        videoTrack.stop();  // Stop the video track to release resources
    } catch (err) {
        console.error("Error: " + err);
    }
    capturing = false;
    console.log("Captured a screenshot");
}

async function captureFrame(imageCapture) {
    try {
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
    } catch (err) {
        console.error("Error: " + err);
    }
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
    const zip = new JSZip();
    const selectedIndices = screenshotVars.map((selected, index) => selected ? index : -1).filter(index => index !== -1);

    selectedIndices.forEach((index, i) => {
        const base64Data = screenshots[index].split(',')[1];
        zip.file(`screenshot_${Date.now()}_${i}.png`, base64Data, { base64: true });
    });

    zip.generateAsync({ type: 'blob' })
        .then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'screenshots.zip';
            link.click();
        })
        .catch(error => {
            console.error('Error creating zip file:', error);
        });
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
        listItem.addEventListener('click', () => showImage(screenshot, index));
        screenshotList.appendChild(listItem);
    });
}

function showImage(src, index) {
    imgPreview.src = src;
    imgPreview.style.display = 'block';
    imgPreview.alt = `Screenshot ${index + 1}`;
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
    viewer.document.write('<html><head><title>Captured Images</title><style>body { font-family: Arial, sans-serif; background-color: #121212; color: #f4f4f4; } ul { list-style: none; padding: 0; } li { margin-bottom: 10px; padding: 5px; cursor: pointer; background-color: #3a3a3a; border-radius: 5px; } li:hover { background-color: #5a5a5a; } #viewer-img { text-align: center; } img { max-width: 100%; max-height: 400px; border: 1px solid #3a3a3a; border-radius: 5px; padding: 5px; background-color: #1e1e1e; } </style></head><body><ul id="viewer-listbox"></ul><div id="viewer-img"></div></body></html>');
    const viewerListbox = viewer.document.getElementById('viewer-listbox');
    screenshots.forEach((screenshot, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Screenshot ${index + 1}`;
        listItem.addEventListener('click', () => {
            const viewerImg = viewer.document.getElementById('viewer-img');
            const img = new Image();
            img.src = screenshot;
            img.alt = `Screenshot ${index + 1}`;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '400px';
            viewerImg.innerHTML = '';
            viewerImg.appendChild(img);
        });
        viewerListbox.appendChild(listItem);
    });
}
