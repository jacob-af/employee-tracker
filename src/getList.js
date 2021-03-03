const connection = require("./connection.js");

const getList = async (field, table) => {
  let list = await connection.awaitQuery(`Select id, ${field} from ${table}`);
  list = list.map((row) => {
    return { name: row[`${field}`], value: row.id };
  });
  return list;
};

module.exports = getList;
