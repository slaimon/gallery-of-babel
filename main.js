export {paintNext, paintPrev, copyGlslSource, saveGlslSource, savePicture}

import {webglRenderFrag} from "./webgl.js"
import * as compute from "./artgen/compute.js"
import * as glsl from "./artgen/glsl/glsl.js"

import { ReversibleGenerator } from "./random.js"
const time = Date.now();
const random = new ReversibleGenerator(BigInt(time));

const webglCanvasPerformance = document.getElementById("performanceCaption");
const nameElement = document.getElementById("nameArea");
const sizeElement = document.getElementById("sizeCaption");
const genomeViewer = document.getElementById("genomeViewer");

async function paint(seed) {
    const webglStart = performance.now();

    const size = compute.get_default_size(seed);
    const picture = compute.random_picture(size, seed);
    nameElement.innerHTML = seed;
    sizeElement.innerHTML = `complexity: ${size}`;
    genomeViewer.innerHTML = picture.gene_listing;
    const shader = glsl.create_shader(picture);

    var canvas = document.getElementById("mainRenderer");
    webglRenderFrag(shader, canvas);

    const webglEnd = performance.now();
    webglCanvasPerformance.innerHTML = `${(webglEnd-webglStart).toFixed(2)} ms`;

    return shader;
}

function makeSeed(integer) {
    let result = '';

    // 128 toki pona words (some less common than others)
    const words = [
        "akesi", "ala", "alasa", "ale",         "anpa", "ante", "awen", "esun",
        "ijo",   "ike", "ilo",   "insa",        "jaki", "jan", "jelo", "kala",
        "kalama", "kama", "kasi", "ken",        "kepeken", "kili", "kiwen", "ko",
        "kon", "kule", "kulupu", "kute",        "lape", "laso", "lawa", "len",
        "lete", "lili", "linja", "lipu",        "loje", "lon", "luka", "lukin",
        "lupa", "ma", "mama", "mani",           "mi", "moku", "moli", "monsi",
        "mun", "musi", "mute", "nanpa",         "nasa", "nasin", "nena", "ni",
        "nimi", "noka", "olin", "ona",          "open", "pakala", "pali", "palisa",
        "pan", "pilin", "pimeja", "pini",       "pipi", "poka", "poki", "pona",
        "pu", "sama", "seli", "selo",           "sewi", "sijelo", "sike", "sina",
        "sinpin", "sitelen", "sona", "soweli",  "suli", "suno", "supa", "tan",
        "tawa", "telo", "tenpo", "toki",        "tomo", "tu", "unpa", "uta",
        "utala", "walo", "wan", "waso",         "wawa", "wile", "kijetesantakalu", "kipisi",
        "ku", "leko", "meli", "mije",           "misikeke", "monsuta", "namako", "soko",
        "tonsi", "su", "oko", "apeja",          "kapesi", "konwe", "melome", "mijomi",
        "mulapisu", "omekapo", "san", "soto",   "unu", "usawi", "yupekosi", "ali"
    ];
    
    let i;
    while(integer > 0) {
        i = integer%(128);
        result += words[i];
        if (integer > 128) {
            result += " ";
        }
        integer = Math.floor(integer/128);
    }

    // avoid leading and trailing whitespace
    if (result[result.length-1] === ' ') {
        result[result.length-1] = '?';
    }
    if (result[0] === ' ') {
        result[0] = 'ì';
    }

    return result;
}

var glslSource;
async function paintNext() {
    random.next();
    const seed = makeSeed(random.integer());
    
    glslSource = await paint(seed);
}
async function paintPrev() {
    random.previous();
    const seed = makeSeed(random.integer());

    glslSource = await paint(seed);
}

function copyGlslSource() {
    if (glslSource) {
        navigator.clipboard.writeText(glslSource);
        exportMessage.innerHTML = "Copied to clipboard!";
    } else {
        exportMessage.innerHTML = "Paint a picture first!";
    }
}

function makeFilename(size, seed) {
    var filename = `${seed} (${size})`;
    return filename.replaceAll(/\*|\/|\\|\||\+|:|<|>|\?|,|\.|;|=|\[|\]/g, "_");
}

function getFilename() {
    var name = filenameElement.value;
    if(name)
        return name;
    else
        return filenameElement.placeholder;
}

function saveGlslSource() {
    if (glslSource) {
        const dataURL = "data:text/plain;charset=utf-8," + encodeURIComponent(glslSource);
        download(`${getFilename()}.frag`, dataURL);
        exportMessage.innerHTML = "Download started...";
    } else {
        exportMessage.innerHTML = "Paint a picture first!";
    }
}

function savePicture() {
    if (glslSource) {
        exportMessage.innerHTML = "Rendering...";
        setTimeout(savePictureAux, 50);
    } else {
        exportMessage.innerHTML = "Paint a picture first!";
    }
}

async function savePictureAux() {
    var width = parseInt(document.getElementById("imageWidth").value);
    width = width ? width : parseInt(document.getElementById("imageWidth").placeholder);
    var height = parseInt(document.getElementById("imageHeight").value);
    height = height ? height : parseInt(document.getElementById("imageHeight").placeholder);

    var canvas = createCanvas(width, height);
    await webglRenderFrag(glslSource, canvas);

    canvas.toBlob((blob)=>{
        const url = URL.createObjectURL(blob);
        download(`${getFilename()}.png`, url);
    });
    canvas.remove();
    exportMessage.innerHTML = "Done!"
}

function download(filename, dataURL) {
    var element = document.createElement('a');
    element.setAttribute('href', dataURL);
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }

  function createCanvas(width, height) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    return canvas;
}