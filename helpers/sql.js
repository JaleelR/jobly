const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  ////datatouodate is an object, json.body 
  ////jsTosql is an object, the columns you are allowed to change for sql
 

 
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
