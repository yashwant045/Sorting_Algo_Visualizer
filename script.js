const container = document.getElementById("container");
const startBtn = document.getElementById("startBtn");
const countDisplay = document.getElementById("countDisplay"); // If you removed the span, ignore this
const userUnput = document.getElementById("userNumbers");
const sizeSlider = document.getElementById("sizeSlider");
const speedSlider = document.getElementById("speedSlider");

let currentAlgo = null;
let isSorting = false;
let shouldStop = false; // FLAG TO KILL LOOPS
let animationSpeed = 50; 

// ================= CONTROLS =================

function updateSpeed() {
    // Reverse logic: Lower value = Faster speed (Less delay)
    // But here we use it as "Delay", so 5ms is fast, 500ms is slow.
    animationSpeed = parseInt(speedSlider.value);
}

async function resetVisualizer() {
    if (isSorting) {
        shouldStop = true; // 1. Tell loops to stop
        // 2. Wait slightly for the loop to actually break
        await sleep(100); 
    }
    
    shouldStop = false;
    isSorting = false;
    startBtn.disabled = false;
    startBtn.innerText = currentAlgo ? `Start ${currentAlgo}` : "Select Algo";
    
    // Regenerate bars based on current slider
    generateRandomBars(sizeSlider.value);
}

function setAlgo(algoName) {
    if (isSorting) return;
    currentAlgo = algoName;
    document.querySelectorAll('.algo-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    startBtn.innerText = `Start ${algoName.charAt(0).toUpperCase() + algoName.slice(1)}`;
    startBtn.classList.add("ready");
    startBtn.disabled = false;
}

function updateSlider() {
    if (isSorting) return;
    generateRandomBars(sizeSlider.value);
}

// ================= GENERATION =================

function generateRandomBars(count = 30) {
    if (isSorting) return;
    container.innerHTML = "";
    const width = Math.floor(1000 / count);
    for (let i = 0; i < count; i++) {
        const value = Math.floor(Math.random() * 380) + 20;
        createBarElement(value, width);
    }
}

function generateCustomBars() {
    if (isSorting) return;
    const input = userUnput.value;
    if (!input) return alert("Enter numbers!");
    const values = input.split(/[\s,]+/).filter(x => x !== "").map(Number);
    if (values.some(isNaN)) return alert("Invalid numbers");
    
    container.innerHTML = "";
    const width = Math.max(10, Math.floor(1000 / values.length));
    values.forEach(val => createBarElement(val, width));
}

function createBarElement(height, width) {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = `${height}px`;
    bar.style.width = `${width}px`;
    if (width > 25) bar.innerText = height;
    container.appendChild(bar);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ================= SORTING LOGIC =================

async function startSorting() {
    if (!currentAlgo || isSorting) return;
    
    isSorting = true;
    shouldStop = false; // Reset stop flag
    startBtn.disabled = true;
    
    animationSpeed = parseInt(speedSlider.value);

    if (currentAlgo === 'bubble') await bubbleSort();
    else if (currentAlgo === 'insertion') await insertionSort();
    else if (currentAlgo === 'selection') await selectionSort();
    else if (currentAlgo === 'quick') {
        let bars = document.querySelectorAll(".bar");
        await quickSort(bars, 0, bars.length - 1);
    }
    else if (currentAlgo === 'merge') {
        let bars = document.querySelectorAll(".bar");
        await mergeSort(bars, 0, bars.length - 1);
    }

    isSorting = false;
    startBtn.disabled = false;
}

// NOTE: Added "if (shouldStop) return;" to all loops

async function bubbleSort() {
    const bars = document.querySelectorAll(".bar");
    for (let i = 0; i < bars.length; i++) {
        for (let j = 0; j < bars.length - i - 1; j++) {
            if (shouldStop) return; // KILL SWITCH

            bars[j].style.backgroundColor = "#e74c3c";
            bars[j+1].style.backgroundColor = "#e74c3c";
            
            await sleep(animationSpeed);

            let val1 = parseInt(bars[j].style.height);
            let val2 = parseInt(bars[j+1].style.height);

            if (val1 > val2) swap(bars[j], bars[j+1]);

            bars[j].style.backgroundColor = "#000000";
            bars[j+1].style.backgroundColor = "#000000";
        }
        bars[bars.length - i - 1].style.backgroundColor = "#2ecc71";
    }
}

async function selectionSort() {
    const bars = document.querySelectorAll(".bar");
    for(let i = 0; i < bars.length; i++){
        if (shouldStop) return; // KILL SWITCH
        
        let minIndex = i;
        bars[i].style.backgroundColor = "#0000ff";

        for(let j = i + 1; j < bars.length; j++){
            if (shouldStop) return; // KILL SWITCH

            bars[j].style.backgroundColor = "#e74c3c";
            await sleep(animationSpeed);

            let val1 = parseInt(bars[j].style.height);
            let val2 = parseInt(bars[minIndex].style.height);

            if(val1 < val2){
                if(minIndex !== i) bars[minIndex].style.backgroundColor = "#000000";
                minIndex = j;
            } else {
                bars[j].style.backgroundColor = "#000000";
            }
        }
        swap(bars[i], bars[minIndex]);
        bars[minIndex].style.backgroundColor = "#000000";
        bars[i].style.backgroundColor = "#2ecc71";
    }
}

async function insertionSort() {
    const bars = document.querySelectorAll(".bar");
    for (let i = 1; i < bars.length; i++) {
        if (shouldStop) return; // KILL SWITCH
        
        let j = i;
        bars[i].style.backgroundColor = "#0000ff";

        while (j > 0) {
            if (shouldStop) return; // KILL SWITCH
            
            await sleep(animationSpeed);
            let val1 = parseInt(bars[j].style.height);
            let val2 = parseInt(bars[j-1].style.height);
            
            bars[j-1].style.backgroundColor = "#e74c3c";

            if (val1 < val2) {
                swap(bars[j], bars[j-1]);
                bars[j].style.backgroundColor = "#000000"; 
                j--;
            } else {
                bars[j-1].style.backgroundColor = "#000000";
                break;
            }
        }
        bars[j].style.backgroundColor = "#000000"; 
    }
    // Final check to color all green if not stopped
    if (!shouldStop) bars.forEach(b => b.style.backgroundColor = "#2ecc71");
}

async function quickSort(bars, low, high) {
    if (shouldStop) return;
    if (low < high) {
        let pi = await partition(bars, low, high);
        await quickSort(bars, low, pi - 1);
        await quickSort(bars, pi + 1, high);
    } else if (low >= 0 && high >= 0 && low < bars.length && high < bars.length) {
       bars[low].style.backgroundColor = "#2ecc71";
       bars[high].style.backgroundColor = "#2ecc71";
    }
}

async function partition(bars, low, high) {
    if (shouldStop) return;
    let pivot = parseInt(bars[high].style.height);
    bars[high].style.backgroundColor = "#0000ff";
    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (shouldStop) return;
        bars[j].style.backgroundColor = "#e74c3c";
        await sleep(animationSpeed);

        let val = parseInt(bars[j].style.height);
        if (val < pivot) {
            i++;
            swap(bars[i], bars[j]);
        }
        bars[j].style.backgroundColor = "#000000";
    }
    swap(bars[i + 1], bars[high]);
    bars[high].style.backgroundColor = "#000000";
    bars[i + 1].style.backgroundColor = "#2ecc71";
    
    return i + 1;
}

async function mergeSort(bars, l, r) {
    if (shouldStop) return;
    if(l >= r) return;
    const m = l + Math.floor((r - l) / 2);
    await mergeSort(bars, l, m);
    await mergeSort(bars, m + 1, r);
    await merge(bars, l, m, r);
}

async function merge(bars, l, m, r) {
    if (shouldStop) return;
    let n1 = m - l + 1;
    let n2 = r - m;
    let L = [], R = [];

    for (let i = 0; i < n1; i++) L.push(parseInt(bars[l + i].style.height));
    for (let j = 0; j < n2; j++) R.push(parseInt(bars[m + 1 + j].style.height));

    let i = 0, j = 0, k = l;
    
    while (i < n1 && j < n2) {
        if (shouldStop) return;
        bars[k].style.backgroundColor = "#e74c3c";
        await sleep(animationSpeed);
        
        if (L[i] <= R[j]) {
            bars[k].style.height = `${L[i]}px`;
            if (bars[k].clientWidth > 25) bars[k].innerText = L[i];
            i++;
        } else {
            bars[k].style.height = `${R[j]}px`;
            if (bars[k].clientWidth > 25) bars[k].innerText = R[j];
            j++;
        }
        bars[k].style.backgroundColor = "#2ecc71";
        k++;
    }

    while (i < n1) {
        if (shouldStop) return;
        await sleep(animationSpeed);
        bars[k].style.height = `${L[i]}px`;
        bars[k].style.backgroundColor = "#2ecc71";
        i++; k++;
    }

    while (j < n2) {
        if (shouldStop) return;
        await sleep(animationSpeed);
        bars[k].style.height = `${R[j]}px`;
        bars[k].style.backgroundColor = "#2ecc71";
        j++; k++;
    }
}

function swap(el1, el2) {
    el1.style.transform = "scale(1.05)";
    el2.style.transform = "scale(1.05)";

    let tempHeight = el1.style.height;
    let tempText = el1.innerText;

    el1.style.height = el2.style.height;
    el1.innerText = el2.innerText;

    el2.style.height = tempHeight;
    el2.innerText = tempText;

    setTimeout(() => {
        el1.style.transform = "scale(1)";
        el2.style.transform = "scale(1)";
    }, animationSpeed);
}

// Init
generateRandomBars(30);