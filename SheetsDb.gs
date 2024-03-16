class SheetsDb {

  constructor(spreadsheetId) {
    this.ss = SpreadsheetApp.openById(spreadsheetId)
  }

  /**
   * @param {string} name Table name
   * @param {array} fields Field names
   */
  createTable(name, fields) {
    fields = stringToArray(fields)
    if (fields.includes("rowId")) throw "Field name 'rowId' is reserved and cannot be used"
    var sheet = this.ss.insertSheet(name)
    sheet.getRange(1, 1, 1, fields.length).setValues([fields])
    console.log(`Created table '${name}' with ${fields.length} fields`)
  }

  /**
   * @param {string} name Table name
   */
  deleteTable(name, ignoreNotExists = false) {
    let sheet = this.ss.getSheetByName(name)
    if (sheet) {
      if (this.ss.getNumSheets() > 1) {
        this.ss.deleteSheet(sheet)
      }
      else {
        sheet.getDataRange().clear()
        sheet.setName("Sheet1")
      }
      console.log(`Deleted table '${name}'`)
    }
    else if (!ignoreNotExists) {
      throw `Table '${name}' does not exist`
    }
  }

  /**
   * @param {string} name Table name
   */
  emptyTable(name) {
    var sheet = this.ss.getSheetByName(name)
    var range = sheet.getDataRange()
    var rows = range.getNumRows() - 1
    var columns = range.getNumColumns()
    if (rows > 0) sheet.getRange(2, 1, rows, columns).clear()
    console.log(`Emptied table '${name}'`)
  }

  /**
   * @param {string} table Table name
   * @param {array} fields Array of field names
   * @param {function} filterFunction Function for filtering
   * @param {string} sortBy Field to sort on
   * @param {boolean} ascending Sort ascending or descending
   * @return {Array} Rows
   */
  select(table, fields = [], filterFunction = r => true, sortBy = "", ascending = true) {
    let [dataFields, rows] = this.getTableData(table)

    // Filter
    if (typeof filterFunction === "function") { rows = rows.filter(filterFunction) }

    // Sort
    if (typeof sortBy === "string" && sortBy.length > 0) {
      if (!dataFields.includes(sortBy)) throw `Unknown sortBy field '${sortBy}'`
      rows.sort((a, b) => {
        a = a[sortBy]
        b = b[sortBy]
        if (typeof a === "string") { a = a.toUpperCase() }
        if (typeof b === "string") { b = b.toUpperCase() }
        if (a == b) { return 0 }
        if (ascending && a < b || !ascending && a > b) { return -1 }
        if (ascending && a > b || !ascending && a < b) { return 1 }
      })
    }

    // Select fields
    fields = stringToArray(fields)
    if (isArray(fields) && fields.length > 0) {
      var outputRows = []
      rows.forEach(row => {
        var rowOutput = []
        fields.forEach(field => {
          if (!field.length) return
          if (!dataFields.includes(field)) throw `Unknown field '${field}'`
          rowOutput[field] = row[field]
        })
        outputRows.push(rowOutput)
      })
      rows = outputRows
    }

    return rows
  }

  /**
   * @param {string} table Table name
   * @param {array} rows Array of row objects
   */
  insert(table, rows) {
    let tableRows = this.getTableData(table)[1]
    let count = tableRows.length
    tableRows = tableRows.concat(rows)
    this.setTableData(table, tableRows)
    console.log(`Inserted ${tableRows.length - count} rows in '${table}'`)
  }

  /**
   * @param {string} table Table name
   * @param {function} filterFunction Function for selecting records to delete
   */
  delete(table, filterFunction = r => true) {
    let sheet = this.ss.getSheetByName(table)
    let rows = this.getTableData(table)[1]
    let count = rows.length
    rows = rows.filter(e => !filterFunction(e))
    this.setTableData(table, rows)
    console.log(`Deleted ${count - rows.length} rows from '${table}'`)
  }

  /**
   * @param {string} table Table name
   * @param {array} values Object with fields/values to update
   * @param {function} filterFunction Function for selecting records to update 
   */
  update(table, values, filterFunction = r => true) {
    let count = 0
    let rows = this.getTableData(table)[1]
    rows.forEach(row => {
      if (filterFunction(row)) {
        Object.assign(row, values)
        count++
      }
    })
    this.setTableData(table, rows)
    console.log(`Updated ${count} rows in '${table}'`)
  }

  getTableData(table) {
    let sheet = this.ss.getSheetByName(table)
    let data = sheet.getDataRange().getValues()
    let fields = data.shift()
    let rows = []
    data.forEach(dataRow => {
      let row = {}
      for (let i = 0; i < fields.length; i++) {
        row[fields[i]] = dataRow[i]
      }
      rows.push(row)
    })
    return [fields, rows]
  }

  setTableData(table, rows) {
    let sheet = this.ss.getSheetByName(table)
    let columnCount = sheet.getDataRange().getNumColumns()
    let rowCount = sheet.getDataRange().getNumRows() - 1
    let fields = sheet.getRange(1, 1, 1, columnCount).getValues()[0]
    let data = []
    rows.forEach(row => {
      let dataRow = []
      Object.keys(row).forEach(key => {
        let index = fields.indexOf(key)
        if (index == -1) throw `Unknown field '${key}'`
        dataRow[index] = row[key]
      })
      // Fix: array length / null-pad array
      if (dataRow.length < fields.length) dataRow[fields.length - 1] = null
      data.push(dataRow)
    })
    if (rowCount > 0) sheet.getRange(2, 1, rowCount, columnCount).clear()
    sheet.getRange(2, 1, data.length, fields.length).setValues(data)
  }

}

function isArray(a) {
  return a !== null && a.constructor === Array
}

function stringToArray(string) {
  if (typeof string === "string") {
    return string.split(",").map(e => e.trim()).filter(e => e.length > 0)
  }
  return string
}
