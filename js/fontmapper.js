var canvas; 
var context;
var canvas2; 
var context2;
var fontMapper;
var autoUpdate = false;

function init(canvasid)
{
	canvas = document.getElementById(canvasid);			
	canvas2 = document.getElementById(canvasid + 'measure');			
	context = canvas.getContext('2d');	
	context2 = canvas2.getContext('2d');	
	fontMapper = new FontMapper();
	fontMapper.draw();
}

function FontMapper()
{
	this.weight = 'normal';
	this.size = 30;
	this.face = 'userfont';
	this.strokeColor = '#FFFFFF';
	this.fillColor = '#00BB00';
	this.lineWidth = 0;
	
	this.characterMap = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";	
	this.charRects = [];
	this.shadow = false;
	this.shadowOffsetX = 4;
	this.shadowOffsetY = 4;
	this.shadowBlur = 4;
	this.shadowColor = '#000000';
	
	this.toggleShadow = function()
	{
		this.shadow = !this.shadow;
		if(this.shadow)
		{
			$('#dropshadowcontrols').show();
		}
		else
		{
			$('#dropshadowcontrols').hide();
		}
		this.draw();
	}
	this.topCrop = 127;
	this.measureCharacter = function(character)
	{
		canvas2.width = canvas2.width;
		context2.textBaseline = 'top';	
		context2.font = this.fontline;
		context2.textAlign = 'left';
		context2.strokeStyle = this.strokeColor;
		context2.fillStyle = this.fillColor;					
		context2.lineWidth = this.lineWidth;
		var X = this.size / 3;
		var Y = this.size / 3;
		if(this.shadow)
		{
			context2.shadowOffsetX = this.shadowOffsetX;
			context2.shadowOffsetY = this.shadowOffsetY;
			context2.shadowBlur    = this.shadowBlur;
			context2.shadowColor   = this.shadowColor;	
		}		
		if(this.lineWidth > 0)
		{
			//alert(parseInt(context.lineWidth));
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
		for(var yd = 0; yd < H; yd++)
		{
			for(var xd = 0; xd < W; xd++)
			{
				pxIndex = ((xd * 4) + ((yd * 4) * W)) + 3;
				//alert(pixeldata.data[pxIndex]);
				if(pixeldata.data[pxIndex] != 0)
				{
					//alert("nonzero at: " + xd + " :: " + pixeldata.data[pxIndex]);
					if(xd < shortest) shortest = xd;
					if(xd > longest) longest = xd;
					if(yd > lowest) lowest = yd;
					if(yd < highest) highest = yd;
				}
			}
		}
		if(highest < this.topCrop) this.topCrop = highest;
		//charheight = this.size * 2 + this.lineWidth;
		charheight = lowest - highest + 1;
		charwidth = longest - shortest + 2;
		if(charwidth < 1) return null;
		character = context2.getImageData(shortest - 1, highest, charwidth, charheight);
		character.topCrop = highest;
		//character = context2.getImageData(X, Y, 100, charheight);
		//alert(shortest + ", " + longest);
		return character;
	}
	
	this.draw = function()
	{
		this.charRects = [];		
		canvas.width = canvas.width; //clear canvas and context settings
		this.fontline = this.weight + ' ' + this.size + 'pt "' + this.face + '"'; 
		

		context.textBaseline = 'top';	
		context.font = this.fontline;
		context.textAlign = 'left';
		context.strokeStyle = this.strokeColor;
		context.fillStyle = this.fillColor;					
		context.lineWidth = this.lineWidth;
		var X = this.lineWidth;
		var Y = 0 + this.lineWidth;//this.size * 1.5;
		chardata = new Array();
		var charheight = 0;
		var minicrop = 128;
		var maxcrop = 0;
		for(var i = 0; i < this.characterMap.length; i++)	
		{	
			context.strokeStyle = this.strokeColor;
			var chr = this.measureCharacter(this.characterMap[i]);
			if(chr != null)
			{
				if (chr.topCrop > maxcrop)
				{
					maxcrop = chr.topCrop;
				}
				if (chr.topCrop < minicrop)
				{
					minicrop = chr.topCrop;
				}
				if (chr.height > charheight)
				{
					charheight = chr.height
				}
			}
			
			chardata.push(chr);			
		}
		var highchar = 0;
		for(var i = 0; i < this.characterMap.length; i++)	
		{
			var chr = chardata[i];
			if(chr != null) 
			{
				chrh = chr.height + chr.topCrop - minicrop;

				if(chrh > highchar) highchar = chrh;

				if(X + chr.width > canvas.width)
				{
					X = this.lineWidth;
					Y += highchar;
					highchar = 0;
				}
				context.putImageData(chr, X, Y + chr.topCrop - minicrop);
				this.charRects.push({ x: X, y: Y, width: chr.width, height: chrh, c: this.characterMap[i]});
				X += chr.width;
			}
					
			context.lineWidth = 1;
			
			context.shadowBlur = 0;
			context.shadowColor = null;
			context.strokeStyle = '#000000';					
		}
	}
}

function toggleFileOptions()
{
	if($('#filecontrols').is(':visible'))
	{
		$('#filecontrols').hide();
	}
	else
	{
		$('#filecontrols').show();
	}
}
function xmlEscape(chr)
{
    switch(chr)
    {
        case '"': return ("&quot;");
        case '&': return ("&amp;");
        case '<': return ("&lt;");
        case '>': return ("&gt;");
        default: return ("") + chr;
    }
}

function saveIrrlicht()
{
	var xmlfile = '<?xml version="1.0"?>\n<font type="bitmap">\n\n\t<Texture index="0" filename="font.png" hasAlpha="true" />\n\n';
	for(var i = 0; i < fontMapper.charRects.length; i ++)	
	{
		xmlfile += '<c c="' + xmlEscape(fontMapper.charRects[i].c) + '" r="' + fontMapper.charRects[i].x + ', ' + fontMapper.charRects[i].y + ', ' + (fontMapper.charRects[i].width + fontMapper.charRects[i].x) + ', ' + (fontMapper.charRects[i].height + fontMapper.charRects[i].y) + '" />\n';
	}
	xmlfile += "</font>"
	//alert(xmlfile);
	$('#xmlput').val(xmlfile);
	$('#pngput').val(canvas.toDataURL());
	document.savefont.submit();
}

function saveXML()
{
	var xmlfile = '<?xml version="1.0"?>\n<font>\n\n\t<image filename="font.png" />\n\n';
	for(var i = 0; i < fontMapper.charRects.length; i ++)	
	{
		xmlfile += '\t<character code="' + xmlEscape(fontMapper.charRects[i].c.charCodeAt(0)) + '" x="' + fontMapper.charRects[i].x + '" y="' + fontMapper.charRects[i].y + '" width="' + fontMapper.charRects[i].width + '" height="' + fontMapper.charRects[i].height  + '" />\n';
	}
	xmlfile += "</font>";
	$('#xmlput').val(xmlfile);
	$('#pngput').val(canvas.toDataURL());
	document.savefont.submit();
}

function fileoptions()
{
	$('#filecontrols').dialog("open");
}
function help()
{
	$('#help').dialog("open");
	$('#helpme').accordion({ autoHeight: false });
}
function toggleAutoUpdate()
{
	autoUpdate = !autoUpdate;
	if(autoUpdate)
	{
		$('#autoupdate').addClass("ui-state-active");
	}
	else
	{
		$('#autoupdate').removeClass("ui-state-active");
	}
}
$(function() 
{
	$('#userfont').click(function()
	{
		$('#loaduserfont').dialog("open");
	});
	$('#justupdate,#autoupdate,#saveirr').hover(
	function(){ 
		$(this).addClass("ui-state-hover"); 
	},
	function(){ 
		$(this).removeClass("ui-state-hover"); 
	});
	
	$('#help').dialog({ autoOpen: false, width: 500, height: 500, title: "Help" });
	$('#loaduserfont').dialog({ autoOpen: false, width: 400, height: 150, title: "Load Font" });
	$('#filecontrols').dialog({ autoOpen: false, width: 300, height: 200, title: "Save" });
	
	$("#sizeslider").slider( 
		{ 
			value: 30, 
			min: 8, 
			max: 72, 
			slide: function(event, ui)
			{ 
				var val = ui.value; 
				$('#sizevalue').html(val); 
				fontMapper.size = val; 
				if(autoUpdate)fontMapper.draw();
			} 
		} );
	$("#outlineslider").slider( 
		{ 
			value: 0, 
			min: 0, 
			max: 12, 
			slide: function(event, ui)
			{ 
				var val = ui.value; 
				$('#outlinevalue').html(val); 
				fontMapper.lineWidth = val; 
				if(autoUpdate)fontMapper.draw();
			} 
		} );
	$("#xoffsetslider").slider( 
		{ 
			value: 4, 
			min: 0, 
			max: 12, 
			slide: function(event, ui)
			{ 
				var val = ui.value; 
				$('#xoffsetvalue').html(val); 
				fontMapper.shadowOffsetX = val; 
				if(autoUpdate)fontMapper.draw();
			} 
		} );		
	$("#yoffsetslider").slider( 
		{ 
			value: 4, 
			min: 0, 
			max: 12, 
			slide: function(event, ui)
			{ 
				var val = ui.value; 
				$('#yoffsetvalue').html(val); 
				fontMapper.shadowOffsetY = val; 
				if(autoUpdate)fontMapper.draw();
			} 
		} );		
	$("#blurslider").slider( 
		{ 
			value: 4, 
			min: 0, 
			max: 12, 
			slide: function(event, ui)
			{ 
				var val = ui.value; 
				$('#blurvalue').html(val); 
				fontMapper.shadowBlur = val; 
				if(autoUpdate)fontMapper.draw();
			} 
		} );				
	$('#shadowstyle').ColorPicker({
		color: '#000000',
		onSubmit: function() {
			$('#shadowstyle').ColorPickerHide();
		},		
		onShow: function (colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onChange: function (hsb, hex, rgb) {
			$('#shadowstyle').css('backgroundColor', '#' + hex);
			$('#shadowstyle').html(hex);
			fontMapper.shadowColor = '#' + hex;
			if(autoUpdate)fontMapper.draw();
		}
	});		
	$('#fillstyle').ColorPicker({
		color: '#0000ff',
		onSubmit: function() {
			$('#fillstyle').ColorPickerHide();
		},		
		onShow: function (colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onChange: function (hsb, hex, rgb) {
			$('#fillstyle').css('backgroundColor', '#' + hex);
			$('#fillstyle').html(hex);
			fontMapper.fillColor = '#' + hex;
			if(autoUpdate)fontMapper.draw();
		}
	});	
	$('#strokestyle').ColorPicker({
		color: '#0000ff',
		onSubmit: function() {
			$('#strokestyle').ColorPickerHide();
		},
		onShow: function (colpkr) {
			$(colpkr).fadeIn(500);
			return false;
		},
		onChange: function (hsb, hex, rgb) {
			$('#strokestyle').css('backgroundColor', '#' + hex);
			$('#strokestyle').html(hex);
			fontMapper.strokeColor = '#' + hex;
			if(autoUpdate)fontMapper.draw();
		}
	});		
	init("fmview");
});
