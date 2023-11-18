const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.



/*
-partially updates sql with incoming data and js used to help update

 takes 2 args that are objects: 
    - json.body data(dataToUpdate) 
    - Some js code to help sql


- Gets all keys from dataToUpdate


-for each key create a string 
  If jsToSql key is present in key array to keep up with sql name changes. 
  If not jsToSql key is not present in key, then just use the key name.
  adds an "=" sign and incrementing parameterized query at the end of string to keep up with number of paramitized querys

- Returns { setCols, values }
  - Where setCols is a string converted from cols array.
    Each indecy in cols array seperated by a comma in new string.
    example { setCols: ""first_name"=$1", "last_name"=$2"......}
    
  -Where values is an array of values from the incoming data object 
  example { values: charles, lee, charles@lee.com......}


*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
