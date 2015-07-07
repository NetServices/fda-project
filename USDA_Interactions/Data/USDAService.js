//global variables
//TODO: make this secure?????????
var apiKey = "RspQyE7vqwceJDz1q5aKkxcFofHac7xmDg5oe3G2";
var labelRootURL = "https://api.fda.gov/drug/label.json";
var lastDrugJSON;
var lastAddedHasInteraction;

/**
 * Object to store drug information in
 * 
 * @param name -
 *            name of the drug to initialize
 * @returns {MedEntry}
 */
function MedEntry(name) {
	this.name = name;
	this.id = "";
	this.interactions = "";
	this.description = "";
	this.dose = "";
	this.hasInteraction = 0;
	this.patientInfo = "";
	this.brandName = "";
	this.genericName = "";
}
/**
 * 
 */
$(document).ready(function() {
	// for testing
	$("#medList").hide();
	$("#details").hide();
	$("#prescriptionlist").hide();
	$("#prescriptionArea").hide();
	$("#listTitle").hide();

	// upon enter selected perform the search
	$("#medication").keypress(function(e) {
		if (e.keyCode == 13) {
			getDrugSummaryForDrugName(this.value);
		}
	});
	$("#searchButton").click(function(e) {
		getDrugSummaryForDrugName($("#medication").val());
	});
	$("#printButton").click(function(e) {
		printList();
	});
	// add a new row with user information
	$("#add-med").click(function() {
		if ($("#dose").val().length) {
			saveData(lastDrugJSON);
		} else {
			alert('Please enter a dosage amount');
		}
	});
	document.getElementById("medDetails").readOnly = true;
	loadDrugTable();

});

/**
 * Calls FDA API to get Interactions for the drugName drugName - generic or
 * brand name
 */

function getDrugInteractionsForDrugName(drugName) {
	query = '&search=drug_interactions:"' + drugName + '"';

	$.ajax( {
		url : labelRootURL + '?api_key=' + apiKey + query,
		error : function(xhr, status, error) {
			alert("No Matches Found");
			$('#drug-name').text("");
			$('#medDetails').text("");
			$('#add-med').prop("disabled", true);
		}
	}).done(function(data) {
		// TODO:
		// next call checkAgainstCurrentDrugs saved locally and display any
		// potential interactions
	});

}

/**
 * Calls FDA API to get Interactions for the drugName drugName - generic or
 * brand name
 */

function getDrugSummaryForDrugName(drugName) {
	loadResultsForQuery('&search=openfda.brand_name:' + drugName + '+'
			+ 'openfda.generic_name:' + drugName);
}

/**
 * Brings up drug based on search query query - the query to pass
 */
function loadResultsForQuery(query) {
	$.ajax( {
		url : labelRootURL + '?api_key=' + apiKey + query,
		error : function(xhr, status, error) {
			alert("No Matches Found");
			$('#drug-name').text("");
			$('#medDetails').text("");
			$('#add-med').prop("disabled", true);
			$("#details").hide();
			$("#listTitle").hide();

		}
	}).done(function(data) {
		$("#details").show();
		$("#prescriptionlist").show();
		if (!data.results[0].openfda.hasOwnProperty("substance_name")) {
			$('#drug-name').text(data.results[0].openfda.brand_name[0]);
		} else {
			$('#drug-name').text(data.results[0].openfda.substance_name[0]);
		}

		$('#medDetails').text(buildAndReturnDrugDescription(data));
		$('#add-med').prop("disabled", false);
		lastDrugJSON = data;
		checkAgainstCurrentDrugs(lastDrugJSON.results[0]);

	});
}
/**
 * Saves selected drug and dosage to the database
 * 
 * @param
 */
function saveData(data) {

	var entry;
	if (!data.results[0].openfda.hasOwnProperty("substance_name")) {
		entry = new MedEntry("name not found");
	} else {
		entry = new MedEntry(data.results[0].openfda.substance_name[0]);
	}
	if (!data.results[0].openfda.hasOwnProperty("generic_name")) {
		entry.genericName = "name not found";
	} else {
		entry.genericName = data.results[0].openfda.generic_name[0];
	}
	if (!data.results[0].openfda.hasOwnProperty("brand_name")) {
		entry.brandName = "name not found";
	} else {
		entry.brandName = data.results[0].openfda.brand_name[0];
	}
	entry.description = buildAndReturnDrugDescription(data);
	entry.id = data.results[0].id;
	if (!data.results[0].hasOwnProperty("drug_interactions")) {
		entry.interactions = "No Interactions Available";
	} else {
		entry.interactions = data.results[0].drug_interactions[0];
	}
	if (!data.results[0].hasOwnProperty("information_for_patients")) {
		entry.patientInfo = "No Information For Patients Available";
	} else {
		entry.patientInfo = data.results[0].information_for_patients[0];
	}
	entry.dose = $('#dose').val();

	addDrugToPersonalDB(entry);
	loadDrugTable();
}

/**
 * delete row and local database
 */

function deleteRowAndDrugID(button) {
	var parent = button.parentNode.parentNode;
	parent.parentNode.removeChild(parent);
	deleteDrugFromDBByID(button.id);
}

/**
 * adds a new row based on last searched item TODO: add validation of dosage
 */
function addNewRow(drug) {
	$("#medList").show();
	var drugName = $('#drug-name').text();
	var deleteButton = '<input type="button" onclick="deleteRowAndDrugID(this)" class="removebtn" value="Delete" id="'
			+ drug.id + '"/>';

	// TODO: check for existing drug
	var acceptCheck = 'checked = "yes"';
	var rejectCheck = "";
	if (drug.hasInteraction) {
		acceptCheck = "";
		rejectCheck = 'checked = "yes"';
	}
	var summary;
	
	if (drug.interactions == "No Interactions Available")
		{
		summary = drug.patientInfo;
		}
	else
		{
		summary = drug.interactions;
		}
	
	$("#medList")
			.append(
					'<tr>' + '<th scope="row">'
							+ drug.name
							+ '</th>'
							+ '<td width="10%" class="center">'
							+ drug.dose
							+ '</td>'
							+ '<td>'
							+ summary.substring(0, 200)
							+ '</td>'
							+ '<td width="10%" class="center">'
							+ '<input type="checkbox" name="acceptMed1" id="acceptMed1"' + acceptCheck+ '>'
							+ '</td>'
							+ '<td width="10%" class="center">'
							+ '<input type="checkbox" name="rejectMed1" id="rejectMed1" '
							+ rejectCheck + '>' + '</td>'
							+ '<td width="10%" class="center">' + deleteButton
							+ '</td>' + '</tr>');

	$('#add-med').prop("disabled", true);
}

/**
 * adds drug information to db TODO: add a better dosage validation and display
 * 
 */
function addDrugToPersonalDB(drug) {
	var drugDBEntries;
	if (localStorage.meds) {
		drugDBEntries = JSON.parse(localStorage.meds);
	} else {
		drugDBEntries = [];
	}
	if (lastAddedHasInteraction) {
		drug.hasInteraction = 1;
	}
	drugDBEntries.push(drug);
	localStorage.meds = JSON.stringify(drugDBEntries);
}

/**
 * loads previous entries from local storage to display table.
 */

function loadDrugTable() {
	var drugDBEntries = null;
	if (localStorage.getItem("meds") != null) {
		drugDBEntries = JSON.parse(localStorage.meds);

		if (drugDBEntries != null) {
			var arrayLength = drugDBEntries.length;
			$("#medList").find("tr:gt(0)").remove();
			for ( var i = 0; i < arrayLength; i++) {

				if (i == 0) {
					$("#prescriptionArea").show();
					$("#listTitle").show();
				}
				addNewRow(drugDBEntries[i]);

			}

		}
	}

}

/**
 * query
 * 
 * @param data -
 *            the JSON to check against MedENtry Objects
 */

function checkAgainstCurrentDrugs(data) {

	var drugDBEntries;
	var interactions = new Array();
	if (localStorage.meds) {
		drugDBEntries = JSON.parse(localStorage.meds);
		lastAddedHasInteraction = false;
		
		/* loop through patient info and interactions to find any names matching */
		for (i = drugDBEntries.length - 1; i >= 0; i--) {
			if (drugDBEntries[i].interactions.toLowerCase().indexOf(data.openfda.substance_name[0]) > -1
					|| drugDBEntries[i].interactions.toLowerCase().indexOf(
							data.openfda.brand_name[0].toLowerCase()) > -1
					|| drugDBEntries[i].interactions.toLowerCase().indexOf(
							data.openfda.generic_name[0].toLowerCase()) > -1) {
				interactions.push(drugDBEntries[i].genericName);
				lastAddedHasInteraction = true;
			} else if (drugDBEntries[i].patientInfo.indexOf(data.openfda.substance_name[0]) > -1
					|| drugDBEntries[i].patientInfo.toLowerCase().indexOf(
							data.openfda.brand_name[0].toLowerCase()) > -1
					|| drugDBEntries[i].patientInfo.toLowerCase().indexOf(
							data.openfda.generic_name[0].toLowerCase()) > -1) {
				interactions.push(drugDBEntries[i].genericName);
				lastAddedHasInteraction = true;
			}
		}
		if (interactions.length > 0)
			{
			  alert("This Drug interacts with: " + interactions.join(", ") );
			}
	}
}

/**
 * 
 * @param drugJSON -
 *            json object to create summary from
 * @returns summary string
 */
function buildAndReturnDrugDescription(drugJSON) {
	var returnString;
	var pharmClass;
	var infoForPatients;
	var drugDescription;

	if (!drugJSON.results[0].openfda.hasOwnProperty("pharm_class_epc")) {
		pharmClass = " No Pharm Class";
	} else {
		pharmClass = drugJSON.results[0].openfda.pharm_class_epc[0];
	}
	if (!drugJSON.results[0].hasOwnProperty("information_for_patients")) {
		infoForPatients = " No Patient Info";
	} else {
		infoForPatients = drugJSON.results[0].information_for_patients[0];
	}
	if (!drugJSON.results[0].hasOwnProperty('merchant_id')) {
		drugDescription = " No Description";
	} else {
		drugDescription = drugJSON.results[0].description[0];
	}

	returnString = pharmClass + '\n' + infoForPatients + '\n\n'
			+ drugDescription;

	return returnString;

}
/**
 * deletes a drug from local storage
 * 
 * @param drugID -
 *            id to delete from the db
 */
function deleteDrugFromDBByID(drugID) {
	var drugDBEntries;
	if (localStorage.getItem("meds") != null) {
		drugDBEntries = JSON.parse(localStorage.meds);

		for (i = drugDBEntries.length - 1; i >= 0; i--) {
			if (drugDBEntries[i].id == drugID) {
				drugDBEntries.splice(i, 1);
			}
		}

		localStorage.meds = JSON.stringify(drugDBEntries);
	}
}

function printList()
{
var divToPrint=document.getElementById("prescriptionListDiv");
newWin= window.open("");
newWin.document.write(divToPrint.outerHTML);
newWin.print();
newWin.close();
}