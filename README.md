# SheetsDb
Google Apps Script for using Spreadsheets as a database

## Methods
```
constructor(spreadsheetId)
createTable(name, fields)
emptyTable(name)
deleteTable(name, ignoreNotExists = false)
insert(table, rows)
select(table, fields = null, filterFunction = null, sortBy = null, ascending = true)
update(table, values, filterFunction = r => true)
delete(table, filterFunction)
```

## Usage example
```
var spreadsheetId = "gU4Du53HdbuG"  // The id from the url of the Spreadsheet to use
var db = new SheetsDb(spreadsheetId)

db.deleteTable("Cars", true)
db.createTable("Cars", ["Brand", "Type", "Color", "Year"])

// Insert
var records = [
  { Brand: "VW", Type: "Golf", Year: 1985 },
  { Type: "Swift", Brand: "Suzuki", Color: "Red" },
  { Brand: "VW", Type: "Polo", Color: "Pink", Year: 2000 },
]
db.insert("Cars", records)

// Select
console.log(db.select("Cars", "", null, "Year"))

// Update
db.update("Cars", { Color: "Black" })
db.update("Cars", { Color: "Silver" }, car => car.Brand == "VW")

// Delete
db.delete("Cars", car => car.Year > 0 && car.Year < 1990)

// Select
console.log(db.select("Cars", "", null, "Year"))

// Empty
db.emptyTable("Cars")

// Select
console.log(db.select("Cars", "", null, "Year"))

db.deleteTable("Cars", true)
```
