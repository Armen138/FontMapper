
var FontMapper = function() {
    var fontline;
    var font = {
        weight : 'normal',
        size : 17,
        face : 'Arial',
        strokeColor : '#FFFFFF',
        fillColor : '#00BB00',
        lineWidth : 0,
        characterMap : " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",
        charRects : [],
        shadow : true,
        shadowOffsetX : 4,
        shadowOffsetY : 4,
        shadowBlur : 4,
        shadowColor : '#000000'
    };
    var lastFont = "Arial";
    var canvas = document.getElementsByTagName("canvas")[0];
    var context = canvas.getContext("2d");

    canvas.width = 512;
    canvas.height = 512;

    var canvas2 = document.createElement("canvas");
    var context2 = canvas2.getContext("2d");

    var pixeldata;
    var charRects = [];
    canvas2.width = 128;
    canvas2.height = 128;

    var loadFont = function(name, data) {
        var style = "<style type='text/css'>@font-face { font-family: " + name + "; src: url('" + data + "'); }</style>";
        document.head.innerHTML += style;
    };
    var measureCharacter = function(character) {
        canvas2.width = canvas2.width;
        context2.textBaseline = 'top';
        context2.font = fontline;
        context2.textAlign = 'left';
        context2.strokeStyle = font.strokeColor;
        context2.fillStyle = font.fillColor;
        context2.lineWidth = font.lineWidth;
        var X = font.size / 3 | 0;
        var Y = font.size / 3 | 0;
        if(font.shadow) {
            context2.shadowOffsetX = font.shadowOffsetX;
            context2.shadowOffsetY = font.shadowOffsetY;
            context2.shadowBlur    = font.shadowBlur;
            context2.shadowColor   = font.shadowColor;
        }
        if(font.lineWidth > 0) {
            context2.strokeText(character, X, Y);
        }
        context2.fillText(character, X, Y);
        pixeldata = context2.getImageData(0,0,canvas2.width - 1, canvas2.height - 1);
        var shortest = 128;
        var longest = 0;
        var lowest = 0;
        var highest = 128;
        var W = 127;
        var H = 127;
        var topCrop = 127;
        for(var yd = 0; yd < H; yd++) {
            for(var xd = 0; xd < W; xd++) {
                pxIndex = ((xd * 4) + ((yd * 4) * W)) + 3;
                if(pixeldata.data[pxIndex] !== 0) {
                    if(xd < shortest) shortest = xd;
                    if(xd > longest) longest = xd;
                    if(yd > lowest) lowest = yd;
                    if(yd < highest) highest = yd;
                }
            }
        }
        charheight = lowest - highest + 1;
        charwidth = longest - shortest + 2;
        if(charwidth < 1) return null;
        character = context2.getImageData(shortest - 1, highest, charwidth, charheight);
        character.topCrop = highest;
        return character;
    };
    var render = function() {
        if(lastFont !== font.face && localStorage[font.face]) {
            loadFont(font.face, localStorage[font.face]);
            font.data = localStorage[font.face];
            lastFont = font.face;
        }
        canvas.width = canvas.width; //clear canvas and context settings
        fontline = font.weight + ' ' + font.size + 'pt "' + font.face + '"';
        charRects = [];
        context.textBaseline = 'top';
        context.font = fontline;
        context.textAlign = 'left';
        context.strokeStyle = font.strokeColor;
        context.fillStyle = font.fillColor;
        context.lineWidth = font.lineWidth;
        var X = font.lineWidth;
        var Y = 0 + font.lineWidth;//this.size * 1.5;
        chardata = [];
        var charheight = 0;
        var minicrop = 128;
        var maxcrop = 0;
        var i, chr;
        for(i = 0; i < font.characterMap.length; i++) {
            context.strokeStyle = font.strokeColor;
            chr = measureCharacter(font.characterMap[i]);
            if(chr !== null) {
                if (chr.topCrop > maxcrop) {
                    maxcrop = chr.topCrop;
                }
                if (chr.topCrop < minicrop) {
                    minicrop = chr.topCrop;
                }
                if (chr.height > charheight) {
                    charheight = chr.height;
                }
            }

            chardata.push(chr);
        }
        var highchar = 0;
        for(i = 0; i < font.characterMap.length; i++)
        {
            chr = chardata[i];
            if(chr !== null)
            {
                chrh = chr.height + chr.topCrop - minicrop;

                if(chrh > highchar) highchar = chrh;

                if(X + chr.width > canvas.width)
                {
                    X = font.lineWidth;
                    Y += highchar;
                    highchar = 0;
                }
                context.putImageData(chr, X, Y + chr.topCrop - minicrop);
                charRects.push({ x: X, y: Y, width: chr.width, height: chrh, c: font.characterMap[i]});
                X += chr.width;
            }

            context.lineWidth = 1;

            context.shadowBlur = 0;
            context.shadowColor = null;
            context.strokeStyle = '#000000';
        }
    };

    canvas.addEventListener("drop", function(e) {
        e.stopPropagation();
        e.preventDefault();
        //alert("dropped... font?");
        var files = e.dataTransfer.files;
        if(files.length > 1) {
            alert("One font at a time please");
            return false;
        }
        var fontFile = files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            var data = e.target.result;
            font.data = data;
            font.face = fontFile.name.replace(".ttf", "");
            localStorage[font.face] = font.data;
            loadFont(font.face, font.data);
            if(fontMapper.onFontChange) {
                fontMapper.onFontChange();
            }
        };
        reader.readAsDataURL(fontFile);
        return false;
    }, false);
    canvas.addEventListener("dragover", function(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }, false);


    xmlEscape = function(chr) {
        switch(chr) {
            case '"': return ("&quot;");
            case '&': return ("&amp;");
            case '<': return ("&lt;");
            case '>': return ("&gt;");
            default: return ("") + chr;
        }
    };

    var fontMapper = {
        render: render,
        run: function() {},
        font: font,
        irrlicht: function() {
            var xmlfile = '<?xml version="1.0"?>\n<font type="bitmap">\n\n\t<Texture index="0" filename="font.png" hasAlpha="true" />\n\n';
            for(var i = 0; i < charRects.length; i ++)
            {
                xmlfile += '<c c="' + xmlEscape(charRects[i].c) + '" r="' + charRects[i].x + ', ' + charRects[i].y + ', ' + (charRects[i].width + charRects[i].x) + ', ' + (charRects[i].height + charRects[i].y) + '" />\n';
            }
            xmlfile += "</font>";
            var data = canvas.toDataURL();
            var zip = new JSZip();
            var binData = atob(data.replace("data:image/png;base64,", ""));
            zip.file("font.xml", xmlfile).file("font.png", binData, {binary: true});
            var blob = zip.generate({type: "blob"});
            window.location = window.URL.createObjectURL(blob);
        },
        json: function() {
            alert(JSON.stringify(font));
        }
    };
    return fontMapper;
};

window.addEventListener("load", function() {
    var fontMapper = new FontMapper();

    var gui = new dat.GUI();

    var font = fontMapper.font;

    gui.add(font, 'characterMap');
    gui.add(font, 'size', 4, 72);
    gui.add(font, 'weight', ['normal', 'bold']);
    var fontFace = gui.add(font, 'face');
    gui.add(font, 'lineWidth', 0, 8);
    gui.addColor(font, 'strokeColor');
    gui.addColor(font, 'fillColor');
    gui.add(font, 'shadow');
    gui.addColor(font, 'shadowColor');
    gui.add(font, 'shadowOffsetX', 0, 16);
    gui.add(font, 'shadowOffsetY', 0, 16);
    gui.add(font, 'shadowBlur', 0, 16);

    fontMapper.onFontChange = function() {
        fontFace.updateDisplay();
    };
    var exportFile = gui.addFolder("export");
    exportFile.add(fontMapper, "irrlicht");
    exportFile.add(fontMapper, "json");
    gui.remember(font);

    setInterval(fontMapper.render, 400);
    fontMapper.run();
});
