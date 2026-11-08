/**
 * ===================================================================
 * GOOGLE APPS SCRIPT - DATABASE LIST DATE KITA 💙
 * ===================================================================
 * Script ini digunakan sebagai backend API gratis untuk aplikasi List Date.
 * Script akan otomatis membuat Tab "MonthlyDates" dan "LongTermDates"
 * jika belum ada di spreadsheet kamu.
 */

function setupSheets(ss) {
  var monthlySheet = ss.getSheetByName("MonthlyDates");
  if (!monthlySheet) {
    monthlySheet = ss.insertSheet("MonthlyDates");
    monthlySheet.appendRow(["id", "name", "date", "location", "locationUrl", "visited"]);
    monthlySheet.getRange("A1:F1").setFontWeight("bold").setBackground("#dbeafe");
    // Seed initial sample
    monthlySheet.appendRow([
      "1",
      "Dinner Romantis di Resto ABC",
      "2026-12-15",
      "Resto ABC, Jakarta Selatan",
      "https://maps.google.com/?q=Jakarta+Selatan",
      false
    ]);
    monthlySheet.appendRow([
      "2",
      "Piknik di Taman Mini",
      "2026-12-20",
      "Taman Mini Indonesia Indah",
      "https://maps.google.com/?q=Taman+Mini+Indonesia+Indah",
      true
    ]);
  }

  var longTermSheet = ss.getSheetByName("LongTermDates");
  if (!longTermSheet) {
    longTermSheet = ss.insertSheet("LongTermDates");
    longTermSheet.appendRow(["id", "name", "date", "location", "locationUrl", "visited", "savingsTarget", "savedAmount"]);
    longTermSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#ede9fe");
    // Seed initial sample
    longTermSheet.appendRow([
      "1",
      "Trip ke Bali",
      "2027-06-01",
      "Bali, Indonesia",
      "https://maps.google.com/?q=Bali+Indonesia",
      false,
      5000000,
      2000000
    ]);
    longTermSheet.appendRow([
      "2",
      "Liburan ke Jepang",
      "2027-12-01",
      "Tokyo, Jepang",
      "https://maps.google.com/?q=Tokyo+Japan",
      false,
      25000000,
      5000000
    ]);
  }

  return { monthlySheet: monthlySheet, longTermSheet: longTermSheet };
}

function getDataFromSheet(sheet) {
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  
  var headers = rows[0];
  var data = [];
  
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var item = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      var val = row[j];
      
      // Formatting
      if (key === "visited") {
        item[key] = (val === true || String(val).toLowerCase() === "true");
      } else if (key === "savingsTarget" || key === "savedAmount") {
        item[key] = Number(val) || 0;
      } else if (key === "date" && val instanceof Date) {
        var yyyy = val.getFullYear();
        var mm = String(val.getMonth() + 1).padStart(2, '0');
        var dd = String(val.getDate()).padStart(2, '0');
        item[key] = yyyy + "-" + mm + "-" + dd;
      } else {
        item[key] = val;
      }
    }
    data.push(item);
  }
  return data;
}

/**
 * Handle GET Request: Mengambil data
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = setupSheets(ss);

    var monthly = getDataFromSheet(sheets.monthlySheet);
    var longTerm = getDataFromSheet(sheets.longTermSheet);

    var result = {
      status: "success",
      message: "Koneksi Google Spreadsheet Berhasil! 💙",
      monthlyDates: monthly,
      longTermDates: longTerm
    };

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST Request: Tambah, Update, Hapus
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = setupSheets(ss);

    var content = e.postData.contents;
    var params = JSON.parse(content);
    var action = params.action; // 'add' | 'update' | 'delete'
    var type = params.type;     // 'monthlyDates' | 'longTermDates'
    var item = params.data || {};

    var targetSheet = (type === "monthlyDates") ? sheets.monthlySheet : sheets.longTermSheet;
    var rows = targetSheet.getDataRange().getValues();

    if (action === "add") {
      var newId = item.id || Date.now().toString();
      if (type === "monthlyDates") {
        targetSheet.appendRow([
          newId,
          item.name || "",
          item.date || "",
          item.location || "",
          item.locationUrl || "",
          Boolean(item.visited)
        ]);
      } else {
        targetSheet.appendRow([
          newId,
          item.name || "",
          item.date || "",
          item.location || "",
          item.locationUrl || "",
          Boolean(item.visited),
          Number(item.savingsTarget) || 0,
          Number(item.savedAmount) || 0
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", action: "add", id: newId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "update") {
      var targetId = String(item.id);
      var rowIndex = -1;
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === targetId) {
          rowIndex = i + 1; // 1-based index
          break;
        }
      }

      if (rowIndex !== -1) {
        if (type === "monthlyDates") {
          targetSheet.getRange(rowIndex, 1, 1, 6).setValues([[
            targetId,
            item.name || "",
            item.date || "",
            item.location || "",
            item.locationUrl || "",
            Boolean(item.visited)
          ]]);
        } else {
          targetSheet.getRange(rowIndex, 1, 1, 8).setValues([[
            targetId,
            item.name || "",
            item.date || "",
            item.location || "",
            item.locationUrl || "",
            Boolean(item.visited),
            Number(item.savingsTarget) || 0,
            Number(item.savedAmount) || 0
          ]]);
        }
        return ContentService.createTextOutput(JSON.stringify({ status: "success", action: "update", id: targetId }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Item tidak ditemukan" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "delete") {
      var delId = String(params.id || (item && item.id));
      for (var j = 1; j < rows.length; j++) {
        if (String(rows[j][0]) === delId) {
          targetSheet.deleteRow(j + 1);
          return ContentService.createTextOutput(JSON.stringify({ status: "success", action: "delete", id: delId }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "ID tidak ditemukan" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Aksi tidak dikenal" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
