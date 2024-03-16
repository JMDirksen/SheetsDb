# SheetsDb
Google Apps Script for using Spreadsheets as a database

## Methods
```
constructor(spreadsheetId)
createTable(name, fields)
emptyTable(name)
deleteTable(name, ignoreNotExists = false)
insert(table, rows)
select(table, fields = [], filterFunction = r => true, sortBy = "", ascending = true)
update(table, values, filterFunction = r => true)
delete(table, filterFunction = r => true)
```

## Example
```
function example() {

  var spreadsheetId = "1i4...Qyw"
  var db = new SheetsDb(spreadsheetId)

  // Start fresh
  db.deleteTable("Cars", true)

  // Create table
  db.createTable("Cars", "Brand, Type, Color, Year")

  // Add records
  var records = [
    { Brand: "VW", Type: "Golf", Year: 1985 },
    { Type: "Swift", Brand: "Suzuki", Color: "Red" },
    { Brand: "VW", Type: "Polo", Color: "Pink", Year: 2000 },
  ]
  db.insert("Cars", records)

  // Select records with filter and sorting
  var rows = db.select("Cars", "Brand, Type, Year, Color", car => car.Year > 0, "Year")
  console.log(rows)

  // Update records
  db.update("Cars", { Color: "Black" })
  db.update("Cars", { Color: "Silver" }, car => car.Brand == "VW")

  var rows = db.select("Cars", "Brand, Color", null, "Color")
  console.log(rows)

  // Delete records
  db.delete("Cars", car => car.Year > 0 && car.Year < 1990)

  // Select all records
  var rows = db.select("Cars")
  console.log(rows)

  // Empty table
  db.emptyTable("Cars")

  // Delete table
  db.deleteTable("Cars")

}
```

Output:
```
Created table 'Cars' with 4 fields

Inserted 3 rows in 'Cars'

[ [ Brand: 'VW', Type: 'Golf', Year: 1985, Color: '' ],
  [ Brand: 'VW', Type: 'Polo', Year: 2000, Color: 'Pink' ] ]

Updated 3 rows in 'Cars'

Updated 2 rows in 'Cars'

[ [ Brand: 'Suzuki', Color: 'Black' ],
  [ Brand: 'VW', Color: 'Silver' ],
  [ Brand: 'VW', Color: 'Silver' ] ]

Deleted 1 rows from 'Cars'

[ { Brand: 'Suzuki', Type: 'Swift', Color: 'Black', Year: '' },
  { Brand: 'VW', Type: 'Polo', Color: 'Silver', Year: 2000 } ]

Emptied table 'Cars'

Deleted table 'Cars'
```