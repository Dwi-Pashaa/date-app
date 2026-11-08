/**
 * ===================================================================
 * GOOGLE APPS SCRIPT - DATABASE LIST DATE KITA 💙
 * ===================================================================
 * Script ini digunakan sebagai backend database realtime untuk web List Date.
 * 
 * SPREADSHEET AKAN MEMILIKI 3 TAB TERPISAH:
 * 1. "MonthlyDates"  -> Daftar kencan / date rutin bulanan kita
 * 2. "LongTermDates" -> Destinasi impian jangka panjang + progress tabungan
 * 3. "KotaTujuan"    -> Rencana trip luar kota + jadwal destinasi & jam kunjungan
 * ===================================================================
 */

function formatCellDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "";
    var yyyy = val.getFullYear();
    var mm = String(val.getMonth() + 1).padStart(2, '0');
    var dd = String(val.getDate()).padStart(2, '0');
    return yyyy + "-" + mm + "-" + dd;
  }
  var s = String(val).trim();
  if (!s || s === "null" || s === "undefined") return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (s.indexOf("T") !== -1) return s.split("T")[0];
  if (s.endsWith(" GM")) s = s + "T";
  var dObj = new Date(s);
  if (!isNaN(dObj.getTime())) {
    var y = dObj.getFullYear();
    var m = String(dObj.getMonth() + 1).padStart(2, '0');
    var d = String(dObj.getDate()).padStart(2, '0');
    return y + "-" + m + "-" + d;
  }
  return s;
}

function setupSheets(ss) {
  // 1. Tab MonthlyDates (Date Bulanan)
  var monthlySheet = ss.getSheetByName("MonthlyDates") || ss.getSheetByName("Bulanan");
  if (!monthlySheet) {
    monthlySheet = ss.insertSheet("MonthlyDates");
    monthlySheet.appendRow(["id", "name", "date", "location", "locationUrl", "visited"]);
    monthlySheet.getRange("A1:F1").setFontWeight("bold").setBackground("#dbeafe").setHorizontalAlignment("center");
    monthlySheet.appendRow([
      "m_1",
      "Dinner Romantis di Resto ABC",
      "2026-12-15",
      "Resto ABC, Jakarta Selatan",
      "https://maps.google.com/?q=Jakarta+Selatan",
      false
    ]);
    monthlySheet.appendRow([
      "m_2",
      "Piknik di Taman Mini",
      "2026-12-20",
      "Taman Mini Indonesia Indah",
      "https://maps.google.com/?q=Taman+Mini+Indonesia+Indah",
      true
    ]);
  }

  // 2. Tab LongTermDates (Jangka Panjang)
  var longTermSheet = ss.getSheetByName("LongTermDates") || ss.getSheetByName("JangkaPanjang");
  if (!longTermSheet) {
    longTermSheet = ss.insertSheet("LongTermDates");
    longTermSheet.appendRow(["id", "name", "date", "location", "locationUrl", "visited", "savingsTarget", "savedAmount"]);
    longTermSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#ede9fe").setHorizontalAlignment("center");
    longTermSheet.appendRow([
      "lt_1",
      "Trip ke Bali",
      "2027-06-01",
      "Bali, Indonesia",
      "https://maps.google.com/?q=Bali+Indonesia",
      false,
      5000000,
      2000000
    ]);
    longTermSheet.appendRow([
      "lt_2",
      "Liburan ke Jepang",
      "2027-12-01",
      "Tokyo, Jepang",
      "https://maps.google.com/?q=Tokyo+Japan",
      false,
      25000000,
      5000000
    ]);
  }

  // 3. Tab KotaTujuan (TAB TERPISAH KHUSUS KOTA TUJUAN & DESTINASI)
  var citySheet = ss.getSheetByName("KotaTujuan") || ss.getSheetByName("CityTrips");
  if (!citySheet) {
    citySheet = ss.insertSheet("KotaTujuan");
    citySheet.appendRow(["id", "cityName", "startDate", "endDate", "notes", "destinations"]);
    citySheet.getRange("A1:F1").setFontWeight("bold").setBackground("#cffafe").setHorizontalAlignment("center");
    citySheet.appendRow([
      "city_1",
      "Bandung Romantis",
      "2026-12-25",
      "2026-12-27",
      "Liburan akhir pekan & keliling cafe estetik berdua 🚙",
      JSON.stringify([
        {
          id: "dest_1",
          placeName: "Sarapan di Roti Macan",
          location: "Jl. Buah Batu, Bandung",
          locationUrl: "https://maps.google.com/?q=Roti+Macan+Bandung",
          date: "2026-12-25",
          time: "08:30",
          visited: false
        },
        {
          id: "dest_2",
          placeName: "Kawah Putih Ciwidey",
          location: "Sugihmukti, Pasirjambu, Bandung",
          locationUrl: "https://maps.google.com/?q=Kawah+Putih+Ciwidey",
          date: "2026-12-25",
          time: "11:00",
          visited: false
        },
        {
          id: "dest_3",
          placeName: "Dinner Romantis The Valley Bistro",
          location: "Jl. Lembah Pakar Timur No. 28, Dago",
          locationUrl: "https://maps.google.com/?q=The+Valley+Bistro+Cafe+Bandung",
          date: "2026-12-25",
          time: "19:00",
          visited: false
        }
      ])
    ]);
  }

  return {
    monthlySheet: monthlySheet,
    longTermSheet: longTermSheet,
    citySheet: citySheet
  };
}

function getDataFromSheet(sheet) {
  if (!sheet) return [];
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
      } else if (key === "destinations") {
        try {
          item[key] = typeof val === "string" ? JSON.parse(val) : val;
        } catch(e) {
          item[key] = [];
        }
      } else if (key === "date" || key === "startDate" || key === "endDate") {
        item[key] = formatCellDate(val);
      } else {
        item[key] = val;
      }
    }
    data.push(item);
  }
  return data;
}

/**
 * Handle GET Request: Mengambil data 3 Tab secara otomatis
 */
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = setupSheets(ss);

    var monthly = getDataFromSheet(sheets.monthlySheet);
    var longTerm = getDataFromSheet(sheets.longTermSheet);
    var cities = getDataFromSheet(sheets.citySheet);

    var result = {
      status: "success",
      message: "Koneksi Google Spreadsheet Berhasil! 💙",
      monthlyDates: monthly,
      longTermDates: longTerm,
      cityTrips: cities,
      kotaTujuan: cities // Alias agar kompatibel
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
    var type = params.type;     // 'monthlyDates' | 'longTermDates' | 'cityTrips' | 'kotaTujuan'
    var item = params.data || {};

    var targetSheet;
    if (type === "monthlyDates" || type === "monthly" || type === "bulanan") {
      targetSheet = sheets.monthlySheet;
    } else if (type === "longTermDates" || type === "longTerm" || type === "jangkaPanjang") {
      targetSheet = sheets.longTermSheet;
    } else if (type === "cityTrips" || type === "cities" || type === "kotaTujuan") {
      targetSheet = sheets.citySheet;
    }

    if (!targetSheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Tab tidak valid: " + type }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var rows = targetSheet.getDataRange().getValues();

    // 1. TAMBAH DATA
    if (action === "add") {
      var newId = item.id || Date.now().toString();
      if (type === "monthlyDates" || type === "monthly" || type === "bulanan") {
        targetSheet.appendRow([
          newId,
          item.name || "",
          formatCellDate(item.date),
          item.location || "",
          item.locationUrl || "",
          Boolean(item.visited)
        ]);
      } else if (type === "longTermDates" || type === "longTerm" || type === "jangkaPanjang") {
        targetSheet.appendRow([
          newId,
          item.name || "",
          formatCellDate(item.date),
          item.location || "",
          item.locationUrl || "",
          Boolean(item.visited),
          Number(item.savingsTarget) || 0,
          Number(item.savedAmount) || 0
        ]);
      } else {
        // Tab KotaTujuan
        targetSheet.appendRow([
          newId,
          item.cityName || "",
          formatCellDate(item.startDate),
          formatCellDate(item.endDate),
          item.notes || "",
          JSON.stringify(item.destinations || [])
        ]);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", action: "add", id: newId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 2. UPDATE DATA
    if (action === "update") {
      var targetId = String(item.id);
      var rowIndex = -1;
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === targetId) {
          rowIndex = i + 1; // 1-based row index
          break;
        }
      }

      if (rowIndex !== -1) {
        if (type === "monthlyDates" || type === "monthly" || type === "bulanan") {
          targetSheet.getRange(rowIndex, 1, 1, 6).setValues([[
            targetId,
            item.name || "",
            formatCellDate(item.date),
            item.location || "",
            item.locationUrl || "",
            Boolean(item.visited)
          ]]);
        } else if (type === "longTermDates" || type === "longTerm" || type === "jangkaPanjang") {
          targetSheet.getRange(rowIndex, 1, 1, 8).setValues([[
            targetId,
            item.name || "",
            formatCellDate(item.date),
            item.location || "",
            item.locationUrl || "",
            Boolean(item.visited),
            Number(item.savingsTarget) || 0,
            Number(item.savedAmount) || 0
          ]]);
        } else {
          // Tab KotaTujuan
          targetSheet.getRange(rowIndex, 1, 1, 6).setValues([[
            targetId,
            item.cityName || "",
            formatCellDate(item.startDate),
            formatCellDate(item.endDate),
            item.notes || "",
            JSON.stringify(item.destinations || [])
          ]]);
        }
        return ContentService.createTextOutput(JSON.stringify({ status: "success", action: "update", id: targetId }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Item tidak ditemukan: " + targetId }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. HAPUS DATA
    if (action === "delete") {
      var delId = String(params.id || (item && item.id));
      for (var j = 1; j < rows.length; j++) {
        if (String(rows[j][0]) === delId) {
          targetSheet.deleteRow(j + 1);
          return ContentService.createTextOutput(JSON.stringify({ status: "success", action: "delete", id: delId }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "ID tidak ditemukan untuk dihapus: " + delId }))
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
