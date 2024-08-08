let capturing = false;
let screenshots = [];
let screenshotVars = [];

document.getElementById('start-btn').addEventListener('click', startCapturing);
document.getElementById('pause-btn').addEventListener('click', pauseCapturing);
document.getElementById('stop-btn').addEventListener('click', stopCapturing);
document.getElementById('save-btn').addEventListener('click', saveSelectedImages);
document.getElementById('select-all-btn').addEventListener('click', selectAll);
document.getElementById('unselect-all-btn').addEventListener('click', unselectAll);
document.getElementById('view-btn').addEventListener('click', openImageViewer);

function startCapturing() {
    capturing = true;
    console.log("Started capturing");
    // Add logic for capturing screenshots on mouse click
}

function pauseCapturing() {
    capturing = false;
    console.log("Paused capturing");
}

function stopCapturing() {
    capturing = false;
    console.log("Stopped capturing");
    // Stop any ongoing screenshot listeners
}

function saveSelectedImages() {
    const selectedIndices = screenshotVars.map((varElem, index) => varElem.checked ? index : -1).filter(index => index !== -1);
    selectedIndices.forEach(index => {
        const screenshot = screenshots[index];
        const link = document.createElement('a');
        link.href = screenshot;
        link.download = `screenshot_${Date.now()}_${index}.png`;
        link.click();
    });
    alert(`Saved ${selectedIndices.length} images.`);
}

function updateListbox() {
    const listbox = document.getElementById('screenshot-list');
    listbox.innerHTML = '';
    screenshots.forEach((screenshot, index) => {
        const listItem = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'screenshot-checkbox';
        checkbox.addEventListener('change', () => {
            screenshotVars[index] = checkbox;
        });
        listItem.appendChild(checkbox);
        listItem.appendChild(document.createTextNode(` Screenshot ${index + 1}`));
        listbox.appendChild(listItem);
    });
}

function showImage(event) {
    const img = event.target;
    if (img) {
        const preview = document.getElementById('img-preview');
        preview.src = img.src;
        preview.style.display = 'block';
    }
}

function selectAll() {
    document.querySelectorAll('.screenshot-checkbox').forEach(checkbox => checkbox.checked = true);
}

function unselectAll() {
    document.querySelectorAll('.screenshot-checkbox').forEach(checkbox => checkbox.checked = false);
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
