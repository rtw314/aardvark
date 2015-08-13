/*<div id="fb-sigpad_control" class="fb-sigpad fb-item-alignment-center"
  style="display:none; cursor: default;">
    <div class="fb-grouplabel sigpad_label_container">
      <label class="sigPad_label">Sign Below</label>
    </div>
    <img class="sigpad_image" src="editordata/images/sigpad.png" />
    <div class="fb-grouplabel sigpad_clear_container">
      <label class="sigPad_clear">Clear</label>
    </div>
  </div>*/
  
/**********************************************************

***********************************************************/

jQuery(document).ready(function($) {
/**********************************************************
Several lines of code that remove the "display:none;" from
the style of the element of id "fb-sigpad_control"
***********************************************************/
//get the outer div element for the signature pad
var sigpadControl = document.getElementById('fb-sigpad_control');

//get the style of that div
var sigpadControlStyle = sigpadControl.getAttribute("style");

//get start and end points for the display:none; portion of the style in the div
if (sigpadControlStyle.indexOf("display:none;") >= 0) {
	var hideLocationStart = sigpadControlStyle.indexOf("display:none;");
	var hideLocationEnd = hideLocationStart + 13;
} else {
	var hideLocationStart = sigpadControlStyle.indexOf("display: none;");
	var hideLocationEnd = hideLocationStart + 13;
}

//set the style to be the same, but without the display:none;
sigpadControlStyle = (hideLocationStart == 0 ? "" : sigpadControlStyle.slice(0, hideLocationStart)) + sigpadControlStyle.slice(hideLocationEnd, sigpadControlStyle.length);
if (sigpadControlStyle.slice(0, 1) == " ") {
  sigpadControlStyle = sigpadControlStyle.slice(1, sigpadControlStyle.length);
}

//apply the new style to the div element
sigpadControl.setAttribute("style", sigpadControlStyle);


/**********************************************************
Replaces the img of class "sigpad_image" with a canvas of
id "sigpad_canvas" as shown below:
<canvas id="sigpad_canvas" width="100%" height="100" style="border:1px solid #000;"></canvas>
Creates a signature pad from the canvas
***********************************************************/
//Get the image element
var sigpadImage = document.getElementsByClassName('sigpad_image')[0];

//Create the canvas element
var sigpadCanvas = document.createElement("CANVAS");
sigpadCanvas.setAttribute("id", "sigpad_canvas");
sigpadCanvas.setAttribute("width", "400");
sigpadCanvas.setAttribute("height", "100");
sigpadCanvas.setAttribute("style", "border:1px solid #000;");

//replace the image with the canvas using the sigpadControl
//defined above and set the canvas var to the new canvas
sigpadControl.replaceChild(sigpadCanvas, sigpadImage);
sigpadCanvas = document.getElementById('sigpad_canvas');

//create signature pad from canvas
var signaturePad = new SignaturePad(sigpadCanvas);

/**********************************************************
Adds a hidden input that will store the image data from the
signature pad:
<input type="text" id="data_uri" name="data_uri" style="display:none;">
***********************************************************/
//create the input element
var imageForm = document.createElement("INPUT");
imageForm.setAttribute("type", "text");
imageForm.setAttribute("id", "data_uri");
imageForm.setAttribute("name", "data_uri");
imageForm.setAttribute("style", "display:none;");

//add the input element to the sigpad control
sigpadControl.appendChild(imageForm);

//set the imageForm var to the new element
imageForm = document.getElementById('data_uri');

/**********************************************************
Replaces the clear label element with a clear button:
<button type="button" id="clear_button" class="fb-button-special non-standard" style="background-color: rgb(38, 67, 133); font-family: Helvetica, Arial; background-image: none; width: auto; height: auto; padding: 10px; border-width: 0px; font-size: 19px; color: #fff; font-weight: bold;">Clear Signature</button>
***********************************************************/
//get the clear label
var clearLabel = document.getElementsByClassName('sigPad_clear')[0];

//get the parent node of the label
var clearParent = document.getElementsByClassName('fb-grouplabel sigpad_clear_container')[0];

//create the clear button and its text node
var clearButton = document.createElement("BUTTON");
var clearText = document.createTextNode("Clear");
clearButton.setAttribute("type", "button");
clearButton.setAttribute("id", "clear_button");
clearButton.setAttribute("class", "fb-button-special non-standard");
clearButton.setAttribute("style", "background-color: rgb(38, 67, 133); font-family: Helvetica, Arial; background-image: none; width: auto; height: auto; padding: 10px; border-width: 0px; font-size: 19px; color: #fff; font-weight: bold;");
clearButton.appendChild(clearText);

//replace the label with the button
clearParent.removeChild(clearLabel);
clearParent.appendChild(clearButton);

//set the clearButton to the new button
clearButton = document.getElementById('clear_button');


/**********************************************************
Gets the submit button and its surrounding div
***********************************************************/
var submitButton = document.getElementById('fb-submit-button');
var submitParent = document.getElementById('fb-submit-button-div');
var hasSubmit = true;

/**********************************************************
Functions
***********************************************************/

function leave_canvas() {
  var imageText = signaturePad.toDataURL();
  imageText = imageText.slice(imageText.search(",") + 1);
  imageForm.value = imageText;
}

function clear_canvas () {
  signaturePad.clear();
  imageForm.value = "";
}

function submit_form () {
  alert("All submissions are final. Are you sure you are ready to submit your application?");
  submitButton.removeEventListener("mouseover", submit_form);
}

function check_signature () {
  if (signaturePad.isEmpty() && hasSubmit) {
    submitButton.setAttribute("disabled",null);
    hasSubmit = false;
  } else {
    submitButton.removeAttribute("disabled");
    hasSubmit = true;
  }
}

function telephoneInput (e) {
  var telText = $(this).val();
  if (e.keyCode == 8) {
    if (telText[telText.length-1]=="-") {
      $(this).val(telText.slice(0,telText.length - 2));
      return false; 
    };
    return true;
  };
  if (e.keyCode == 9 && telText.length == 12) { //tab key
    return true;
  };
  switch (telText.length) {
    case 3:
    case 7:
      telText = telText + "-";
      $(this).val(telText);
      break;
    case 12:
      $(this).val($(this).val().slice(0,11));
  }
  return e.keyCode!=189 && e.keyCode!=109;
}

function socialInput (e) {
  var socialText = $(this).val();
  if (e.keyCode == 8) {
    if (socialText[socialText.length-1]=="-") {
      $(this).val(socialText.slice(0,socialText.length - 2));
      return false; 
    };
    return true;
  };
  switch (socialText.length) {
    case 3:
    case 6:
      socialText = socialText + "-";
      $(this).val(socialText);
      break;
    case 12:
      $(this).val($(this).val().slice(0,11));
  }
  return e.keyCode!=189 && e.keyCode!=109;
}

/**********************************************************
Event Listeners
***********************************************************/

sigpadCanvas.addEventListener("mouseout", leave_canvas);
clearButton.addEventListener("click", clear_canvas);
submitButton.addEventListener("mouseover", submit_form);
document.body.addEventListener("mouseover", check_signature);
jQuery("[type='tel']").keydown(telephoneInput);
jQuery("[name='soc-sec-no']").keydown(socialInput);
});
