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
	this.hasInteraction = "";
}
/**
 * 
 */
$(document).ready(function() {
	// for testing
	$("#medList").hide();
	// upon enter selected perform the search
	$("#medication").keypress(function(e) {
		if (e.keyCode == 13) {
			getDrugSummaryForDrugName(this.value);
		}
	});
	$("#searchButton").click(function(e) {
		getDrugSummaryForDrugName($("#medication").val());
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
		}
	}).done(function(data) {
		$('#drug-name').text(data.results[0].openfda.substance_name[0]);
		$('#medDetails').text(buildAndReturnDrugDescription(data));
		$('#add-med').prop("disabled", false);
		lastDrugJSON = data;
		checkAgainstCurrentDrugs(data);
		// TODO:
		// next call checkAgainstCurrentDrugs and display any potential
		// interactions
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
	entry.description = buildAndReturnDrugDescription(data);
	entry.id = data.results[0].id;
	if (!data.results[0].hasOwnProperty("drug_interactions")) {
		entry.interactions = "No Interactions Available";
	} else {
		entry.interactions = data.results[0].drug_interactions[0];
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
var acceptCheck = "YES";
var rejectCheck = "NO";
	if(lastAddedHasInteraction)
		{
		  acceptCheck = "NO";
		  rejectCheck = "YES";
		}
	$("#medList")
			.append(
					'<tr>'
							+ '<th scope="row">'
							+ drug.name
							+ '</th>'
							+ '<td width="10%" class="center">'
							+ drug.dose
							+ '</td>'
							+ '<td>'
							+ drug.interactions.substring(0, 200)
							+ '</td>'
							+ '<td width="10%" class="center">'
							+ '<input type="checkbox" name="acceptMed1" id="acceptMed1" checked = ' +acceptCheck +'>'
							+ '</td>'
							+ '<td width="10%" class="center">'
							+ '<input type="checkbox" name="rejectMed1" id="rejectMed1" '+acceptCheck +'>'
							+ '</td>' + '<td width="10%" class="center">'
							+ deleteButton + '</td>' + '</tr>');

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
	drugDBEntries.push(drug);
	localStorage.meds = JSON.stringify(drugDBEntries);
}

/**
 * loads previous entries from local storage to display table.
 */

function loadDrugTable() {
	var drugDBEntries;
	if (localStorage.getItem("meds") != null)  {
		drugDBEntries = JSON.parse(localStorage.meds);
	

	if (drugDBEntries) {
		var arrayLength = drugDBEntries.length;
		$("#medList").find("tr:gt(0)").remove();
		for ( var i = 0; i < arrayLength; i++) {
			addNewRow(drugDBEntries[i]);
		}
	}
	}

}

/**
 * query
 * 
 * @param data -
 *            the MedEntry object to check for interactions with
 */

function checkAgainstCurrentDrugs(data) {

	var drugDBEntries;
	if (localStorage.meds) {
		drugDBEntries = JSON.parse(localStorage.meds);
		lastAddedHasInteraction = 0;
		for (i = drugDBEntries.length - 1; i >= 0; i--) {
			if (drugDBEntries[i].interactions.indexOf(data.name) > -1) {
				alert("This Drug interacts with: " + data.name);
				lastAddedHasInteraction = 1;
			}
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

	returnString = pharmClass + '\n' + '  ' + infoForPatients + '\n\n' + '  '
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
