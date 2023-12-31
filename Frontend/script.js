class Color {
  constructor(id, hex, rgba) {
    this.id = id;
    this.hex = hex;
    this.selected = true;
  }

  //hex value to rgba value
  convertToRGB() {
    var newhex;
    this.newhex = this.hex.replace("#", "");
    var bigint = parseInt(this.newhex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;
    this.rgba = [r, g, b, 255];
  }
}

var prismacolors = [];

for (var i = 0; i < prismacolors.length; i++) {
  prismacolors[i].convertToRGB();
}

//create html canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//load image
var imagepix = [];

var image = new Image();

var WIDTH;
var HEIGHT;

//choose image and colors
const IMAGEPATH = "lynley.jpg";

const PALLETE = "rubiks"; //"colors" for prismacolors, "rubiks" for rubiks cube, "legos" for legos

var colorURL;

if (PALLETE == "legos") {
  colorURL = "https://rebrickable.com/api/v3/lego/colors/";
} else {
  colorURL = `https://imageserver-pirf.onrender.com/${PALLETE}`;
}

fetch(colorURL, {
  headers: {
    authorization: "key fa705e8ba715f838fa45ae64382d9142",
  },
})
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    //add data to array
    if (PALLETE == "legos") {
      var list = data.results;
      for (var i = 0; i < list.length; i++) {
        var col = new Color(list[i].name, list[i].rgb);
        col.convertToRGB();
        prismacolors.push(col);
      }
    } else {
      for (var i = 0; i < data.length; i++) {
        var col = new Color(data[i].id, data[i].hex);
        col.convertToRGB();
        prismacolors.push(col);
      }
    }

    //fetch image
    fetch(`https://imageserver-pirf.onrender.com/${IMAGEPATH}`)
      .then((response) => {
        return response.blob();
      })
      .then((data) => {
        image.src = URL.createObjectURL(data);
      });
  });

image.onload = function () {
  canvas.width = image.width;
  canvas.height = image.height;
  WIDTH = image.width;
  HEIGHT = image.height;
  ctx.drawImage(image, 0, 0);
  imagepix = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  render(imagepix);
};

var blocksize = 20;

var newpixelarr = [];

function render(pix) {
  pixels = [];
  //pixel formatting
  pixels = createGoodArray(pix, WIDTH, HEIGHT);
  //redefine width and height after change
  var newWIDTH = pixels[0].length;
  var newHEIGHT = pixels.length;
  //create pixelated image array
  newpixelarr = createPixelArray(pixels, newWIDTH, newHEIGHT);
  //findclosestcolors
  newpixelarr = findCloseColors(newpixelarr, prismacolors);
  //render as blocks
  //renderAsBlocks(newWIDTH, newHEIGHT, newpixelarr);
  //render as divs
  renderAsDivs(newWIDTH, newHEIGHT, newpixelarr);
}

//handle slider
var slider = document.getElementById("slider");
slider.oninput = () => {
  blocksize = parseInt(slider.value);
  blocksize = 201 - blocksize;
  render(imagepix);
};

function createGoodArray(pixels, WIDTH, HEIGHT) {
  var understandable = [];
  //create new understandeable array
  for (var i = 0; i < pixels.length / 4; i++) {
    var newarr = [];
    for (var j = 0; j < 4; j++) {
      newarr.push(pixels[i * 4 + j]);
    }
    understandable.push(newarr);
    newarr = [];
  }

  //force understandeable into rows
  var out = [];
  for (var i = 0; i < HEIGHT; i++) {
    var row = [];
    for (var j = 0; j < WIDTH; j++) {
      row.push(understandable[i * WIDTH + j]);
    }
    out.push(row);
    row = [];
  }

  //slice image to be divisible by blocks
  //slice rows
  var rowstoslice = out.length % blocksize;
  for (var i = 0; i < rowstoslice; i++) {
    out.pop();
  }
  //remove colomns
  var colstoslice = out[0].length % blocksize;
  for (var i = 0; i < out.length; i++) {
    for (var j = 0; j < colstoslice; j++) {
      out[i].pop();
    }
  }

  return out;
}

function createPixelArray(pixels, WIDTH, HEIGHT) {
  var out = [];
  var r = 0;
  var g = 0;
  var b = 0;
  //make width and height for pixelated image
  var width = WIDTH / blocksize;
  var height = HEIGHT / blocksize;
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      //for every new pixel

      var block = [];
      r = 0;
      g = 0;
      b = 0;

      for (var k = i * blocksize; k < i * blocksize + blocksize; k++) {
        for (var l = j * blocksize; l < j * blocksize + blocksize; l++) {
          r += pixels[k][l][0];
          g += pixels[k][l][1];
          b += pixels[k][l][2];
        }
      }

      block[0] = r / (blocksize * blocksize);
      block[1] = g / (blocksize * blocksize);
      block[2] = b / (blocksize * blocksize);
      block[3] = 255;

      out.push(block);
      block = [];
    }
  }
  return out;
}

function findCloseColors(pixels, prismacolors) {
  for (var i = 0; i < pixels.length; i++) {
    var min = 195075;
    var closestColor = "";
    for (var j = 0; j < prismacolors.length; j++) {
      var dist =
        0.3 * Math.pow(prismacolors[j].rgba[0] - pixels[i][0], 2) +
        0.59 * Math.pow(prismacolors[j].rgba[1] - pixels[i][1], 2) +
        0.11 * Math.pow(prismacolors[j].rgba[2] - pixels[i][2], 2);
      if (dist < min && prismacolors[j].selected) {
        min = dist;
        closestColor = prismacolors[j];
      }
    }
    pixels[i][0] = closestColor.rgba[0];
    pixels[i][1] = closestColor.rgba[1];
    pixels[i][2] = closestColor.rgba[2];
    pixels[i][3] = closestColor;
  }
  return pixels;
}

function renderAsBlocks(oldwidth, oldheight, pixels) {
  canvas.width = oldwidth;
  canvas.height = oldheight;
  var cols = canvas.width / blocksize;
  var rows = canvas.height / blocksize;
  ctx.fillStyle = "blue";
  var count = 0;

  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      //set color for current block
      ctx.fillStyle = `rgba(${pixels[count][0]},${pixels[count][1]},${pixels[count][2]},255)`;

      ctx.fillRect(j * blocksize, i * blocksize, blocksize, blocksize);

      count++;
    }
  }
}

function renderAsDivs(width, height, pixels) {
  var box = document.getElementById("imagebox");

  box.innerHTML = "";

  box.style.width = `${width}px`;
  box.style.height = `${height}px`;

  var cols = width / blocksize;
  var rows = height / blocksize;

  var count = 0;

  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      var newel = document.createElement("div");
      newel.id = `${count}`;
      newel.classList.add("block");
      newel.style.width = `${blocksize}px`;
      newel.style.height = `${blocksize}px`;
      newel.style.background = `rgba(${pixels[count][0]},${pixels[count][1]},${pixels[count][2]},255)`;
      newel.style.display = "inline";
      newel.style.float = "left";
      //newel.style.border = "1px solid black";
      newel.style.boxSizing = "border-box";
      newel.addEventListener("mouseover", elementHover);
      box.appendChild(newel);
      count++;
    }
  }
}

function elementHover(color) {
  var text = document.getElementById("pixelinfo");
  text.innerText = `Color: ${newpixelarr[color.target.id][3].id}`;
}
