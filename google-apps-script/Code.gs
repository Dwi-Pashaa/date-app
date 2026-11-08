/**
 * ===================================================================
 * GOOGLE APPS SCRIPT - DATABASE LIST DATE KITA 💙
 * ===================================================================
 * Script ini digunakan sebagai backend database realtime & storage foto untuk web List Date.
 * 
 * SPREADSHEET MEMILIKI 3 TAB TERPISAH:
 * 1. "MonthlyDates"  -> Daftar date rutin bulanan kita (lengkap dengan foto kenangan)
 * 2. "LongTermDates" -> Destinasi impian jangka panjang + progress tabungan
 * 3. "KotaTujuan"    -> Rencana trip kota + foto cover + itinerary tempat & jam
 * ===================================================================
 */

/**
 * ⚡ PENTING UNTUK FITUR FOTO:
 * Jalankan fungsi ini SEKALI di editor Apps Script (Pilih "authorizeDriveApp" lalu klik "Run" / "Jalankan")
 * untuk memberikan izin akses Google Drive agar foto bisa disimpan otomatis.
 */
function authorizeDriveApp() {
  var folderName = "List Date Photos Kita 📸";
  var folders = DriveApp.getFoldersByName(folderName);
  var targetFolder;
  if (folders.hasNext()) {
    targetFolder = folders.next();
  } else {
    targetFolder = DriveApp.createFolder(folderName);
  }
  Logger.log("Izin Tulis Google Drive BERHASIL diaktifkan! Folder: " + targetFolder.getName());
}

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
    monthlySheet.appendRow(["id", "name", "date", "location", "locationUrl", "visited", "imageUrl"]);
    monthlySheet.getRange("A1:G1").setFontWeight("bold").setBackground("#dbeafe").setHorizontalAlignment("center");
    monthlySheet.appendRow([
      "m_1",
      "Dinner Romantis di Resto ABC",
      "2026-12-15",
      "Resto ABC, Jakarta Selatan",
      "https://maps.google.com/?q=Jakarta+Selatan",
      false,
      ""
    ]);
    monthlySheet.appendRow([
      "m_2",
      "Piknik di Taman Mini",
      "2026-12-20",
      "Taman Mini Indonesia Indah",
      "https://maps.google.com/?q=Taman+Mini+Indonesia+Indah",
      true,
      ""
    ]);
  } else {
    // Pastikan header imageUrl ada di kolom G jika belum ada
    var mHeaders = monthlySheet.getRange(1, 1, 1, Math.max(monthlySheet.getLastColumn(), 1)).getValues()[0];
    if (mHeaders.indexOf("imageUrl") === -1) {
      monthlySheet.getRange(1, mHeaders.length + 1).setValue("imageUrl").setFontWeight("bold").setBackground("#dbeafe");
    }
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
  }

  // 3. Tab KotaTujuan (TAB TERPISAH KHUSUS KOTA TUJUAN & DESTINASI)
  var citySheet = ss.getSheetByName("KotaTujuan") || ss.getSheetByName("CityTrips");
  if (!citySheet) {
    citySheet = ss.insertSheet("KotaTujuan");
    citySheet.appendRow(["id", "cityName", "startDate", "endDate", "notes", "destinations", "coverUrl"]);
    citySheet.getRange("A1:G1").setFontWeight("bold").setBackground("#cffafe").setHorizontalAlignment("center");
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
          visited: false,
          imageUrl: ""
        }
      ]),
      ""
    ]);
  } else {
    // Pastikan header coverUrl ada di kolom G jika belum ada
    var cHeaders = citySheet.getRange(1, 1, 1, Math.max(citySheet.getLastColumn(), 1)).getValues()[0];
    if (cHeaders.indexOf("coverUrl") === -1) {
      citySheet.getRange(1, cHeaders.length + 1).setValue("coverUrl").setFontWeight("bold").setBackground("#cffafe");
    }
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
        item[key] = val !== undefined && val !== null ? val : "";
      }
    }
    data.push(item);
  }
  return data;
}

/**
 * Upload gambar base64 ke Google Drive
 * Disimpan di folder otomatis "List Date Photos Kita 📸"
 */
function handleImageUpload(base64Data, originalFileName) {
  try {
    var folderName = "List Date Photos Kita 📸";
    var folders = DriveApp.getFoldersByName(folderName);
    var targetFolder;
    if (folders.hasNext()) {
      targetFolder = folders.next();
    } else {
      targetFolder = DriveApp.createFolder(folderName);
    }

    var cleanBase64 = base64Data;
    var contentType = "image/webp";
    if (base64Data.indexOf(",") !== -1) {
      var parts = base64Data.split(",");
      cleanBase64 = parts[1];
      var match = parts[0].match(/:(.*?);/);
      if (match) contentType = match[1];
    }

    var fileName = originalFileName || ("photo_" + Date.now() + (contentType.indexOf("webp") !== -1 ? ".webp" : ".jpg"));
    var decoded = Utilities.base64Decode(cleanBase64);
    var blob = Utilities.newBlob(decoded, contentType, fileName);
    var file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    // Direct public preview URL
    var directUrl = "https://lh3.googleusercontent.com/d/" + fileId;

    return {
      status: "success",
      url: directUrl,
      fileId: fileId
    };
  } catch (err) {
    return {
      status: "error",
      message: err.toString()
    };
  }
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
      kotaTujuan: cities
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
 * Handle POST Request: Tambah, Update, Hapus, dan Upload Foto
 */
function doPost(e) {
  try {
    var content = e.postData.contents;
    var params = JSON.parse(content);
    var action = params.action; // 'add' | 'update' | 'delete' | 'uploadImage'

    // 0. HANDLE UPLOAD FOTO KE GOOGLE DRIVE
    if (action === "uploadImage") {
      var uploadResult = handleImageUpload(params.base64, params.fileName);
      return ContentService.createTextOutput(JSON.stringify(uploadResult))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = setupSheets(ss);

    var type = params.type; // 'monthlyDates' | 'longTermDates' | 'cityTrips' | 'kotaTujuan'
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
          Boolean(item.visited),
          item.imageUrl || ""
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
          JSON.stringify(item.destinations || []),
          item.coverUrl || ""
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
          targetSheet.getRange(rowIndex, 1, 1, 7).setValues([[
            targetId,
            item.name || "",
            formatCellDate(item.date),
            item.location || "",
            item.locationUrl || "",
            Boolean(item.visited),
            item.imageUrl || ""
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
          targetSheet.getRange(rowIndex, 1, 1, 7).setValues([[
            targetId,
            item.cityName || "",
            formatCellDate(item.startDate),
            formatCellDate(item.endDate),
            item.notes || "",
            JSON.stringify(item.destinations || []),
            item.coverUrl || ""
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
