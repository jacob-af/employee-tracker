const connection = require("./connection.js");

const getList = async (field, table) => {
  try {
    let list = await connection.awaitQuery(`Select id, ${field} from ${table}`);
    list = list.map((row) => {
      return { name: row[`${field}`], value: row.id };
    });
    return list;
  } catch (error) {
    console.error(`***** ${error.sqlMessage} *****`);
  }
};

module.exports = getList;
