var apiKey="RspQyE7vqwceJDz1q5aKkxcFofHac7xmDg5oe3G2";
var labelRootURL="https://api.fda.gov/drug/label.json";
$(document).ready(function()
 {
   $("#search_input").keypress(function(e) {
  if(e.keyCode == 13)
     {
         getDrugSummaryForDrugName(this.value);
     }
});
});


function getDrugInteractionsForDrugName(drugName)
{
  loadResultsForQuery('&search=drug_interactions:"' + drugName + '"'); 
}

function getDrugSummaryForDrugName(drugName)
{
  loadResultsForQuery('&search=openfda.brand_name:' + drugName); 
}

//brings up drug information for the selected drug
function loadResultsForQuery(query)
{
 $.ajax(
    {
        url: labelRootURL + '?api_key=' + apiKey + query
    }).done(function(data) 
    {
    
       $('.drug-name').text(data.results[0].openfda.substance_name[0]);
       $('.interactions').text(data.results[0].active_ingredient[0]);
       //todo:
       //next call checkAgainstCurrentDrugs and display any potential interactions
    });
}


//user adds drug information to db
//Drug Name (ID)
//Dosage
function addDrugToPersonalDB(drugName, drugID, drugDosage)
{

//call API to save data

}

//get previously added data
//Drug Name (ID)
//Dosage
function addDrugToPersonalDB(drugName, drugID, drugDosage)
{

//call API to save data

}

//query web service for any interactions with drug to add
function checkAgainstCurrentDrugs(query)
{


}



