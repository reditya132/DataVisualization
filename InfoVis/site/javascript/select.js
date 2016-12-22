d3.queue()
	.defer(d3.tsv, "../datasets/data_tab_delimited.txt")
	.defer(d3.tsv, "../datasets/metadata.txt")
	.await(ready);

function ready(error, data, metadata) {
	addSelect(data, metadata, "selectVariableA", "variableA");
	addSelect(data, metadata, "selectVariableB", "variableB")
}

function addSelect(data, metadata, divID, selectID){
	// Shows the metadata in a select element.
	var thema;
	var selectHtml = "";
	selectHtml += "<select id = " + selectID +  " size='20'>" ;
	metadata.forEach(function(d){
		if(d.Verschijningsfrequentie == "1 keer per jaar"){
			if(d.THEMA !== thema){
				if(thema !== undefined){
					selectHtml += "</optgroup>";
				}
				thema = d.THEMA;
				selectHtml += "<optgroup label='" + thema + "'>";
			}
			selectHtml += "<option value='" +d.Variabele.replace(" ","") + "'" + "title='" + d.Definitie + "'" + ">" + d.Label + "</option>";
		}
	});
	selectHtml +=  "</select>" ;
	$( "#" + divID ).append( selectHtml );
	$("#" + selectID).chosen();
}