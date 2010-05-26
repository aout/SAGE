var gIncludedFiles = new Array();
gIncludedFiles.push("sage3d.js");

Array.prototype.inArray = function (value) {
	for (var i = 0; i < this.length; ++i)
		if (this[i] === value)
			return true;
	return false;
};

function include(fileName) {
	if (!gIncludedFiles.inArray(fileName))
	document.write("<script type=\"text/javascript\" src=\"" + fileName + "\"></script>");
}

include("Root.js");


function main() {
	var root = new Root();
	
	if (!root.init("viewport", {R: 0, G: 0, B: 0, A: 1}, 1))
		alert("init failure");
	else
		alert("init success");
}
