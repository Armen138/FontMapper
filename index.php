<?php
	$target_path = "teaspoon.ttf";
	$fontname = "teaspoon";
	$filestatus = "not ok";
	
	if(isset($_FILES['ttffile']))
	{
		$target_path = "./userfonts_ttf/";

		$target_path = $target_path . basename( $_FILES['ttffile']['name']); 
	
		#only TTF files allowed!
		$filenameA = explode(".", basename($_FILES["ttffile"]["name"])); 
        $filenameext = strtolower($filenameA[count($filenameA)-1]);
        if($filenameext == 'ttf')
        {		
			$fontname = basename($_FILES['ttffile']['name']);
			if(move_uploaded_file($_FILES['ttffile']['tmp_name'], $target_path)) {
				$filestatus = "file ok";	
			}
		}
		else
		{			
			echo "Only TrueType Font(.TTF) files are allowed";
		}
	}

?>
<!doctype html>
<html>
	<head>
		<title>FontMapper</title>
		<style type='text/css'>
		body{
			position: relative;
		}
		@font-face {
		  font-family: userfont;
		  src: url(<?php echo $target_path; ?>);
		}		
		.fontmapper {
			position: relative;
			width: 900px;
			margin-left: auto;
			margin-right: auto;
		}
		</style>
		<link type="text/css" href="css/overcast/jquery.ui.css" rel="stylesheet" />
		<link rel="stylesheet" media="screen" type="text/css" href="css/colorpicker.css" />
		<link type="text/css" href="css/fontmapper.css" rel="stylesheet" />
		<script type='text/javascript' src='js/jquery.js'></script>
		<script type='text/javascript' src='js/jquery.ui.js'></script>
		<script type="text/javascript" src="js/colorpicker.js"></script>		
		<script type='text/javascript' src='js/fontmapper.js' media="screen, print"></script>
	</head>
	<body>	
		<div class='fontmapper'>
			<nav id='icons'>
				<a href='javascript:fileoptions()'><img src='images/icons/document-save.png'/></a>
				<a href='javascript:appoptions()'><img src='images/icons/preferences-system.png'/></a>
				<a href='javascript:help()'><img src='images/icons/help-browser.png'/></a>
			</nav>
			<div class='controls'>
				<div style='clear: both;'></div>
				<div class='control'>font: </div><div class='control' id='userfont'><?php echo $fontname; ?></div>
				<div class='control'>size: <span id='sizevalue'>30</span></div>
				<div class='control'><div id='sizeslider'></div></div><br/>
				<div class='control'>outline width: <span id='outlinevalue'>1</span></div>
				<div class='control'><div id='outlineslider'></div></div><br/>			
				<div class='control'>fill color: </div>
				<div id='fillstyle' class='control'>#000000</div>
				<div class='control'>outline color: </div>
				<div id='strokestyle' class='control'>#000000</div>
				<div style='clear: both;'></div>			
				<div class='subcontrols'>
					<div id='dropshadow' class='widecontrol' onclick='fontMapper.toggleShadow()'>enable drop shadow</div><br/>	
					<div id='dropshadowcontrols' style='display: none;'>
						<div class='control'>shadow color: </div>
						<div id='shadowstyle' class='control'>#000000</div>
						<div class='control'>X Offset: <span id='xoffsetvalue'>4</span></div>
						<div class='control'><div id='xoffsetslider'></div></div><br/>
						<div class='control'>Y Offset: <span id='yoffsetvalue'>4</span></div>
						<div class='control'><div id='yoffsetslider' ></div></div><br/>			
						<div class='control'>Blur: <span id='blurvalue'>4</span></div>
						<div class='control'><div id='blurslider'></div></div><br/>			
						<div style='clear: both;'></div>
					</div>
				</div>
				<div style='clear: both;'><br/></div>
				
				<div class='control'><a id='autoupdate' href='javascript:toggleAutoUpdate()' class="fg-button ui-state-default ui-corner-all">auto update</a></div><br style='clear: both;'/>
				<div class='control'><a id='justupdate' href='javascript:fontMapper.draw()' class="fg-button ui-state-default ui-corner-all">update</a></div>

			</div>
			<div id='gamediv'>	
				<div class='canvaswrap'>	
					<canvas width='512' height='512' id='fmview'>
						<div style='color: black; font-size: 24px; font-weight: bolder; text-align: center;'>
							<span style='font-size: 32px;'>Canvas support missing!</span>
							<br/>
							FontMapper requires a browser that supports the CANVAS tag. <br/>
							Try Google Chrome or Mozilla Firefox!
						</div>
					</canvas>
				</div>
				<canvas width='128' height='128' id='fmviewmeasure' class='invisiblecanvas'>
				</canvas>
			</div>

			<div id='filecontrols'>
				<div id='save' class='widecontrol'> <a href='javascript:saveXML()' id='saveirr' class="fg-button ui-state-default ui-corner-all">save XML</a></div>
				<div id='save' class='widecontrol'> <a href='javascript:saveIrrlicht()' id='saveirr' class="fg-button ui-state-default ui-corner-all"><img src='images/irrlicht.png' style='vertical-align: middle' />save for Irrlicht</a></div>
				<form action='ziptest.php' method='POST' name='savefont'>
					<input id='xmlput' type='hidden' value='stuff' name='xml' />
					<input id='pngput' type='hidden' value='stuff' name='png' />
				</form>
				<div style='clear: both;'></div>
			</div>					
			
			<div id='loaduserfont'>
			<form action='fontmapper.php' method='POST' name='submituserfont' enctype='multipart/form-data'>
				<input name="ttffile" type="file" class='upload' />
				<input type="submit" value="Load Font" />
			</form>
			</div>
			
			<div id='help'>
				
				<div id='helpme'>
					<h1><a href='#'>About</a></h1>
					<div style='font-size: 12px;'>
					FontMapper is a port of a C++ application of the same name, written in 2008 by Armen Nieuwenhuizen.<br/>
					The web-based FontMapper has the same functionality, and more.
					</div>
					<h1><a href='#'>Using a generated font in Irrlicht</a></h1>
					<div style='font-size: 12px;'>
					The following code demonstrates how to load and use a newly generated font in Irrlicht:<br/>
					<blockquote>
						device->getFileSystem()->addZipFileArchive("font1272343445.zip");<br/>
						IGUISkin* skin = env->getSkin();<br/>
						IGUIFont* font = env->getFont("font.xml");<br/>
						if (font)<br/>
							skin->setFont(font);<br/>
						//To make sure the font's color is preserved<br/>
						env->getSkin()->setColor(EGDC_BUTTON_TEXT, SColor(255, 255, 255, 255));<br/>
					</blockquote>
					</div>
					<h1><a href='#'>Known issues</a></h1>
					<div>
						The webbased FontMapper makes use of the HTML5 canvas, and this may cause some problems on some browsers. 
						Tested and found working on Opera 10+, Firefox 4+, IE9+, and Google Chrome.
					</div>
					<h1><a href='#'>Dealing with fonts</a></h1>
					<div>
						Many fonts you can find online are copyrighted. Check the site you downloaded the font from for a copyright notice.
						Using this tool on copyrighted fonts may not be legal. Check with copyright holder for the font you intend to use
						before using it in any serious projects.
					</div>			
				</div>
			</div>
		</div>
	</body>
</html>
