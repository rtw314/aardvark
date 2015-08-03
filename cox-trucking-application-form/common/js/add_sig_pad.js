/* 
	signature_pad.js and this file should be called at the end of the 
	body of the document with script tags.
*/

// This should contain the ID of the respective elements in the form
var formID = 'docContainer';
/*var canvasID = 'signature_canvas';
var clearButtonID = 'clear_button';
var submitButtonID = 'fb-submit-button';*/

//var frame = window.frameElement;
var form = document.getElementById(formID);
var jForm = '#' + formID;
/*var canvas = document.getElementById(canvasID);
var clearButton = document.getElementById(clearButtonID);
var submitButton = document.getElementById(submitButtonID);
var submitButtonClone = submitButton.cloneNode(true);
var submitParent = submitButton.parentNode;
var imageForm = document.getElementById("data_uri");
var randomRadio1 = document.getElementById("item37_0_radio");
var randomRadio2 = document.getElementById("item37_1_radio");*/
var isButton = true;
var isClicked = false;
var hasFixed = false;
var isScrolled = true;

var submitInput = document.createElement("INPUT");
submitInput.type = "submit";
submitInput.className = "fb-button-special non-standard";
submitInput.id = "fb-submit-button";
submitInput.setAttribute("style", "background-color: rgb(38, 67, 133); font-family: Helvetica, Arial; background-image: none; width: auto; height: auto; padding: 10px; border-width: 0px; font-size: 19px;");
submitInput.setAttribute("value", "Submit Application");
submitInput.setAttribute("data-regular", "");
//submitInput.setAttributeNode(document.createAttribute("").value = "");

var signaturePad = new SignaturePad(canvas);

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
	if (isButton) {
		if(signaturePad.isEmpty()) {
			alert("Please provide a signature first.");
		}
	} else if (!isClicked) {
		isClicked = true;
		if (frame.height != form.style.height) {
			frame.height = form.style.height;
		}
	}
}

function check_signature () {
	if (signaturePad.isEmpty() && !(isButton)) {
		submitParent.removeChild(submitParent.children[0]);
		submitParent.appendChild(submitButtonClone);
		submitButton = document.getElementById(submitButtonID);
		submitButton.addEventListener("click", submit_form);
		isButton = true;
		isClicked = false;
	} else if (!(signaturePad.isEmpty()) && isButton){
		submitParent.removeChild(submitParent.children[0]);
		submitParent.appendChild(submitInput);
		submitButton = document.getElementById(submitButtonID);
		submitButton.addEventListener("click", submit_form);
		isButton = false;
		isClicked = false;
		
	};
}

canvas.addEventListener("mouseout", leave_canvas);
clearButton.addEventListener("click", clear_canvas);
submitButton.addEventListener("click", submit_form);
document.body.addEventListener("mouseover", check_signature);