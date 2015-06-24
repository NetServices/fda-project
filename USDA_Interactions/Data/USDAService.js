//global variables
//TODO: make this secure?????????
var apiKey = "RspQyE7vqwceJDz1q5aKkxcFofHac7xmDg5oe3G2";
var labelRootURL = "https://api.fda.gov/drug/label.json";

//jquery init
$(document).ready(function() {
	//upon enter selected perform the search
	$("#medication").keypress(function(e) {
		if (e.keyCode == 13) {
			getDrugSummaryForDrugName(this.value);
		}
	});
	//add a new row with user information
	$("#add-med").click(function() {
		if ($("#dose").val().length) {
			addNewRowAndSave();
		} else {
			alert('Please enter a dosage amount');
		}
	});
});

/*
 * Calls FDA API to get Interactions for the drugName
 * drugName - generic or brand name
 */

function getDrugInteractionsForDrugName(drugName) 
{
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
		//TODO:
		//next call checkAgainstCurrentDrugs saved locally and display any potential interactions
	});
	
}

/*
 * Calls FDA API to get Interactions for the drugName
 * drugName - generic or brand name
 */

function getDrugSummaryForDrugName(drugName) {
	loadResultsForQuery('&search=openfda.brand_name:' + drugName);
}

/**
 Brings up drug based on search query

 query - the query to pass
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
		$('#medDetails').text(data.results[0].openfda.pharm_class_epc[0]);
		$('#add-med').prop("disabled", false);
		//TODO:
		//next call checkAgainstCurrentDrugs and display any potential interactions
	});
}

/*
 * adds a new row based on last searched item
 * TODO: add validation of dosage
 */
function addNewRowAndSave() {

	var drugName = $('#drug-name').text();
	//TODO: check for existing drug
	$("#medList")
			.append(
					'<tr>'
							+ '<th scope="row">'
							+ drugName
							+ '</th>'
							+ '<td width="10%" class="center">'
							+ $('#dose').val()
							+ '</td>'
							+ '<td>'
							+ $('#medDetails').val()
							+ '</td>'
							+ '<td width="10%" class="center">'
							+ '<input type="checkbox" name="acceptMed1" id="acceptMed1">'
							+ '</td>'
							+ '<td width="10%" class="center">'
							+ '<input type="checkbox" name="rejectMed1" id="rejectMed1">'
							+ '</td>' + '</tr>');

	 $('#add-med').prop("disabled",true);
}

/**
 user adds drug information to db
 Drug Name (ID) - Drug Generic Name
 DrugID - string id from USDA DB
 drugDosage - string indicating your dosage for reference - simple string for no
 drugJSON - JSON retrieved from the API

 TODO: add a better dosage validation and display

 */
function addDrugToPersonalDB(drugName, drugID, drugDosage, drugJSON) 
{
	//save data locally

}

//get previously added data
//Drug Name (ID)
//Dosage
function loadDrugTable()
{

	//get data from local storage and display

}

//query web service for any interactions with drug to add
function checkAgainstCurrentDrugs(query) {

}
