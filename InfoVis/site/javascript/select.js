// Loads the data and meta data of the Amsterdam dataset.
d3.queue()
	.defer(d3.tsv, "../datasets/metadata.txt")
	.await(ready);

// When the data has been loaded selections will be showed for the two variables.
function ready(error, metadata) {
	addSelect(metadata, "selectVariableA", "variableA");
	addSelect(metadata, "selectVariableB", "variableB");
}

// Append a variable selection to an element.
function addSelect(metadata, divID, selectID){
	// Shows the metadata in a select element.
	var thema;
	var selectHtml = "";
	selectHtml += "<select id = " + selectID +  " size='20'>" ;
	metadata.forEach(function(d){
		// Variables that are not measured once a year will not be option in the selec element.
		if(d.Verschijningsfrequentie == "1 keer per jaar"){
			// If this variable has another thema a new group will be created.
			if(d.THEMA !== thema){
				if(thema !== undefined){
					selectHtml += "</optgroup>";
				}
				thema = d.THEMA;
				selectHtml += "<optgroup label='" + thema + "'>";
			}
			// A new select option gets created per variable with value, title and label from metadata..
			selectHtml += "<option value='" +d.Variabele.replace(" ","") + "'" + "title='" + d.Definitie + "'" + ">" + d.Label + "</option>";
		}
	});
	selectHtml +=  "</optgroup></select>" ;
	$( "#" + divID ).append( selectHtml );
	$("#" + selectID).chosen();
}