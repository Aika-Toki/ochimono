const spreadsheet = SpreadsheetApp.openById("1KHuPtLnkrB9XECj_N4CcZ6nrpF3bLVwcuHUqOeNvtgI");
function doGet(e) {
	if (e == undefined) {
		var e = {
			parameter: {
				rec: 0,
				time: 0,
				name: 0,
			},
		};
	}
	let sheets = spreadsheet.getSheets();
	let sheet = sheets[0];
	let record = e.parameter.rec,
		recordmilli = e.parameter.recm,
		time = e.parameter.time,
		name = e.parameter.name;
	let last = Number(sheet.getRange("D1").getValue());
	sheet.insertRowAfter(1);
	sheet.getRange("A2").setValue(time);
	sheet.getRange("B2").setValue(name);
	sheet.getRange("C2").setValue(recordmilli);
	sheet.getRange("D2").setValue(record);
	sheet.getRange("D1").setValue(last + 1);
	let datarange = sheet.getRange(2, 1, last - 1, 4);
	datarange.sort({ column: 3, ascending: true });
}
function sort() {
	let sheets = spreadsheet.getSheets();
	let sheet = sheets[0];
	let last = Number(sheet.getRange("D1").getValue());
	Logger.log(last);
	let datarange = sheet.getRange(2, 1, last - 1, 4);
	datarange.sort({ column: 3, ascending: true });
}
