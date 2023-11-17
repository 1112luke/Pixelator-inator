//get colors array
import { prismacolors } from "./colors";

//create html canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

var blocksize = 11

var img;
function preload() {
    
    img = loadImage('assets/lynley.jpg');
}

function setup() {

    createCanvas(1000,1000);
    //load image
    img.loadPixels();
    var WIDTH = img.width;
    var HEIGHT = img.height;
    //pixel formatting
    var pixels = createGoodArray(img.pixels,WIDTH,HEIGHT);
    //redefine width and height after change
    var WIDTH = pixels[0].length;
    var HEIGHT = pixels.length;
    //create pixelated image array
    var newpixelarr = createPixelArray(pixels,WIDTH,HEIGHT);
    //findclosestcolors
    var newpixelarr = findCloseColors(newpixelarr, prismacolors);
    //make image from pixelated array
    var newimg = makeImage(newpixelarr,WIDTH,HEIGHT);
    //render as blocks
    renderAsBlocks(WIDTH, HEIGHT, newpixelarr);
    //display image 
    //newimg.loadPixels();
    //newimg.resize(350,0);
    //image(newimg, 350, 350);
    //image(img, 100,100);
}

//handle slider

var slider = document.getElementById("slider");
slider.oninput = function(){
    blocksize = this.value;
    setup();
}


  function createGoodArray(pixels,WIDTH,HEIGHT){
    var understandable = [];
    //create new understandeable array
    for(var i = 0; i < pixels.length/4; i++){
        var newarr = []
        for(var j = 0; j < 4; j++){
            newarr.push(pixels[(i*4)+j])
        }
        understandable.push(newarr);
        newarr = []
    }
    
    //force understandeable into rows
    var out = []
    for(var i = 0; i < HEIGHT; i++){
        var row = [];
        for(var j = 0; j < WIDTH; j++){
            row.push(understandable[i*WIDTH+j])
        }
        out.push(row);
    }

    //slice image to be divisible by blocks
    //slice rows
    var rowstoslice = out.length % blocksize;
    for(var i = 0; i < rowstoslice; i++){
       out.pop();
    }
    //remove colomns
    var colstoslice = out[0].length % blocksize;
    for(var i = 0; i < out.length; i++){
        for(var j = 0; j < colstoslice; j++){
            out[i].pop();
        }
    }

    return out;
  }

  function createPixelArray(pixels,WIDTH,HEIGHT){
    var out = [];
    var r = 0;
    var g = 0;
    var b = 0;
    //make width and height for pixelated image
    var width = WIDTH / blocksize;
    var height = HEIGHT / blocksize
    for(var i = 0; i < width; i++){
        for(var j = 0; j < height; j++){
            //for every new pixel

            var block = [];
            r = 0;
            g = 0;
            b = 0;

            for(var k = i*blocksize; k < i*blocksize + blocksize; k++){
                for(var l = (j*blocksize); l < (j*blocksize)+blocksize; l++){
                    r += pixels[k][l][0];
                    g += pixels[k][l][1];
                    b += pixels[k][l][2];
                }
            }

            block[0] = r/(blocksize*blocksize);
            block[1] = g/(blocksize*blocksize);
            block[2] = b/(blocksize*blocksize);
            block[3] = 255;

            out.push(block);
            block = [];
        }
    }
    return out;
  }

  function makeImage(pix,WIDTH,HEIGHT){
    let out = createImage(WIDTH/blocksize, HEIGHT/blocksize);
    out.loadPixels();
    let numPixels = out.width * out.height;
    for (let i = 0; i < numPixels; i++) {
    // Red.
    out.pixels[4*i] = pix[i][0];
    // Green.
    out.pixels[4*i+1] = pix[i][1];
    // Blue.
     out.pixels[4*i + 2] = pix[i][2];
     // Alpha.
    out.pixels[4*i + 3] = 255;
    }
    out.updatePixels();
    return out;
  }

  
  function findCloseColors(pixels, colors){
    for(var i = 0; i < pixels.length; i++){
        var min = 195075;
        var closestColor = ""; 
        for (var j = 0; j < prismacolors.length; j++){
            var dist = Math.pow((prismacolors[j].rgba[0]-pixels[i][0]),2) + Math.pow((prismacolors[j].rgba[1]-pixels[i][1]),2) 
            + Math.pow((prismacolors[j].rgba[2]-pixels[i][2]),2);
            if (dist < min){
                min = dist;
                closestColor = prismacolors[j];
            } 
        }
        pixels[i][0] = closestColor.rgba[0];
        pixels[i][1] = closestColor.rgba[1];
        pixels[i][2] = closestColor.rgba[2];
        pixels[i][3] = 255;
    }
  }

  function renderAsBlocks(oldwidth, oldheight, pixels){
    canvas.width = oldwidth;
    canvas.height = oldheight;
    var cols = canvas.width / blocksize;
    var rows = canvas.height / blocksize;
    ctx.fillStyle = "blue";
    var count = 0;

    for(var i = 0; i < rows; i++){
        for(var j = 0; j < cols; j++){
            //set color for current block
            ctx.fillStyle = `rgba(${pixels[count][0]},${pixels[count][1]},${pixels[count][2]},255)`;

            ctx.fillRect(j*blocksize,i*blocksize,blocksize,blocksize);

            count ++;
        }
    }
  }


  

