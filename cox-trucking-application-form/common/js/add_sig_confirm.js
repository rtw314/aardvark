$().ready(function () {
	var tr = $("tr:contains('DataUri:')");
	tr.replaceWith("<tr><td>Signature:</td><td><img id='signature'></td></tr>");
	var dataUri = $(tr,"td").last().text();
	dataUri = dataUri.replace("DataUri:", "");
	$("#signature").attr("src", "data:image/png;base64,"  + dataUri);
})