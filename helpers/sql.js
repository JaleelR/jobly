const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.



/*
-partially updates sql with incoming data and js used to help us sql
  both arguments are objects 

- Gets keys from incoming data
for each key create a string 
where column is a key that matches each 
dataToUpdate key with conguent one in jsToSqlkey
wtih a incrementing parameterized query
- if jsToSqlkey and dataToUpdate key don't match, put dataToUpdate
key ascolumn

This returns colums with parameterized queries after "SET" and values needed 
to define parameterized queries 
{ setCols, values }
  - Where setCols is a string converted from cols array.
    Each indecy in cols array has an equal sign and a
    parameterized query attatched and seperated by a comma in new string.
    example { setCols: ""first_name"=$1", "last_name"=$2"......}
    
  -Where values is an array of values from the incoming data object 
  example { values: charles, lee, charles@lee.com......}


*/



function sqlForPartialUpdate(dataToUpdate, jsToSql) {
 

 
  const keys = Object.keys(dataToUpdate);
  //////////////get the json.body keys and put it as array 
  //[firstname, password, isadmin]

  if (keys.length === 0) throw new BadRequestError("No data");
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']


////////////////there was nothing to update if no keys 
  const cols = keys.map((colName, idx) =>
      //maps through keys, each key is named colName, second arg is idx
    
    //getting each column in keys
    //and writing 

    //$index is incrementing by the index of array
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
    
    /*
    - you are getting getting each key in jsToSql that correlates 
    to jsonbody keys
      --if it does not correlate make the json key the column 
    --the $1 value will be be incremented by one by each index 
    //creating an sql query 
    */
  );

  return {
    //returning  a setCols key & turning cols array into a string seperated by commas
    setCols: cols.join(", "),
    //returning a values key and returning datatoupdate values as array 
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
