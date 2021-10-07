// Initialize minisheet db
function initDB(spreadsheet, sheetName, col_length, row_start, json) {
  const db = new miniSheetDB2.init(spreadsheet, sheetName, {
    col_length,
    row_start,
    json,
  });

  return db;
}

// ---------- Initialize Sheet Class ---------- //

// InitDB class
class EbinaSheet {
  constructor(userId = 0) {
    this.userId = userId;
    this.db = initDB(spreadsheetInitId, "UserList", 6, 2, true);
  }

  addUser(email, spreadsheetId, spreadsheetUrl, reminder = "On", photo = null) {
    this.db.add(
      this.userId,
      email,
      spreadsheetId,
      spreadsheetUrl,
      reminder,
      photo
    );

    return true;
  }

  getUser() {
    let userList;
    let finalData = {
      ok: false,
    };

    try {
      userList = this.db.searchAll(/\d+/);
    } catch (e) {
      return finalData;
    }

    if (this.userId == 0) return userList;

    // Check for id
    userList.forEach((user) => {
      const data = user.data;

      if (data[0] == this.userId) {
        finalData = {
          ok: true,
          userId: data[0],
          email: data[1],
          spreadsheetId: data[2],
          spreadsheetUrl: data[3],
          reminder: data[4],
          photo: data[5],
        };
      }
    });

    return finalData;
  }

  getUsers() {
    return this.getUser();
  }

  deleteUser(email = undefined) {
    const rowId = this.db.key(this.userId).row;
    this.db.sheet.deleteRow(rowId);

    if (email) SpreadsheetApp.openById(spreadsheetInitId).removeViewer(email);

    return true;
  }
}

// ---------- User Spreadsheet Class ---------- //

class UserSheet {
  constructor(userId) {
    this.userId = userId;
    this.ebinaSheet = new EbinaSheet(userId);
    this.checkId = this.ebinaSheet.getUser(userId);
  }

  createNewSpreadsheet(email) {
    // Check user id
    // if (this.checkId.ok) return this.checkId;

    // Validate email
    const dbInit = SpreadsheetApp.openById(spreadsheetInitId);
    dbInit.addViewer(email);

    // Create new spreadsheet
    const templateSheet = SpreadsheetApp.openById(templateSpreadsheetId);
    const newSheet = templateSheet.copy(`Ebina-${this.userId}`);
    newSheet.addEditor(email);
    this.ebinaSheet.addUser(email, newSheet.getId(), newSheet.getUrl());

    // Return object
    return {
      success: true,
      url: newSheet.getUrl(),
    };
  }

  changeUserEmail(email) {
    if (!this.checkId.ok) throw new Error("User not found!");

    // Validate email
    const dbInit = SpreadsheetApp.openById(spreadsheetInitId);
    dbInit.addViewer(email);

    // Remove and add new editor
    const userSpreadsheet = SpreadsheetApp.openById(this.checkId.spreadsheetId);
    userSpreadsheet.addEditor(email);
    userSpreadsheet.removeEditor(this.checkId.email);

    // Remove and add new user
    this.ebinaSheet.deleteUser(this.checkId.email);
    this.ebinaSheet.addUser(
      email,
      this.checkId.spreadsheetId,
      this.checkId.spreadsheetUrl,
      this.checkId.reminder,
      this.checkId.photo
    );

    // Return object
    return {
      success: true,
      oldEmail: this.checkId.email,
      newEmail: email,
    };
  }

  toggleReminder(reminder) {
    if (!this.checkId.ok) throw new Error("User not found!");

    if (this.checkId.reminder == reminder)
      return {
        success: false,
        message: `Reminder already turned ${reminder.toLowerCase()}!`,
      };

    this.ebinaSheet.deleteUser();
    this.ebinaSheet.addUser(
      this.checkId.email,
      this.checkId.spreadsheetId,
      this.checkId.spreadsheetUrl,
      reminder,
      this.checkId.photo
    );

    return {
      success: true,
      reminder,
    };
  }

  setPhotoProfile(fileID) {
    if (!this.checkId.ok) throw new Error("User not found!");

    if (this.checkId.photo == fileID)
      return {
        success: false,
        message: "Please select another photo!",
      };

    this.ebinaSheet.deleteUser();
    this.ebinaSheet.addUser(
      this.checkId.email,
      this.checkId.spreadsheetId,
      this.checkId.spreadsheetUrl,
      this.checkId.reminder,
      fileID
    );

    return {
      success: true,
    };
  }

  removeUser() {
    if (!this.checkId.ok) throw new Error("User not found!");

    const userSpreadsheet = SpreadsheetApp.openById(this.checkId.spreadsheetId);
    userSpreadsheet.rename(`Ebina-${this.userId}-Stopped`);
    this.ebinaSheet.deleteUser(this.checkId.email);

    return {
      success: true,
      url: this.checkId.spreadsheetUrl,
    };
  }
}

// ---------- Notes Class ---------- //

class NotesSheet {
  constructor(checkId) {
    this.checkId = checkId;

    if (checkId.ok) {
      this.userDB = initDB(checkId.spreadsheetId, "Catatan", 2, 2, true);
    }
  }

  setNote(key, value) {
    if (!this.checkId.ok) throw new Error("User not found!");

    let rowId;
    let isExist;

    try {
      rowId = this.userDB.key(key).row;
      if (rowId) isExist = true;
    } catch (e) {
      isExist = false;
    }

    if (isExist) {
      this.userDB.sheet.deleteRow(rowId);
    }

    this.userDB.add(key, value);

    return {
      success: true,
      key,
    };
  }

  getNote(key) {
    if (!this.checkId.ok) throw new Error("User not found!");

    let data;

    try {
      data = this.userDB.key(key).data;
    } catch (e) {
      throw new Error("Note unavailable");
    }

    return {
      success: true,
      key,
      data: data[1],
    };
  }

  getNotesKey() {
    if (!this.checkId.ok) throw new Error("User not found!");

    const finalData = [];
    let result;

    try {
      result = this.userDB.searchAll(/^#/i);
    } catch (e) {
      return {
        success: false,
        message: "No note available",
      };
    }

    result.forEach((note) => {
      const data = note.data;
      finalData.push(data[0]);
    });

    return {
      success: true,
      keyList: finalData,
    };
  }

  delNote(key) {
    if (!this.checkId.ok) throw new Error("User not found!");

    let rowId;

    try {
      rowId = this.userDB.key(key).row;
    } catch (e) {
      throw new Error("Note unavailable");
    }

    this.userDB.sheet.deleteRow(rowId);

    return {
      success: true,
      key,
    };
  }
}

// ---------- Google Drive Class ---------- //

class EbinaDrive {
  constructor() {
    this.ebinaDrive = DriveApp;
  }

  deleteStopped() {
    const allSheets = this.ebinaDrive.getFilesByType(
      "application/vnd.google-apps.spreadsheet"
    );
    let stoppedList = [];

    while (allSheets.hasNext()) {
      const sheet = allSheets.next();

      if (sheet.getName().match(/Ebina-\d+-Stopped/gi)) {
        let data = {
          name: sheet.getName(),
          id: sheet.getId(),
        };

        try {
          sheet.setTrashed(true);

          if (sheet.isTrashed()) {
            data = {
              success: true,
              ...data,
            };
          } else {
            data = {
              success: false,
              message: "Unexpected error occured while move file to trash!",
              ...data,
            };
          }
        } catch (e) {
          data = {
            success: false,
            message: e.message,
            ...data,
          };
        }

        stoppedList.push(data);
      }
    }

    return stoppedList;
  }
}

// ---------- Subjects functions ---------- //

function getSubjects(userId, key) {
  key = key ? key : days[0];

  const ebinaSheet = new EbinaSheet(userId);
  const checkId = ebinaSheet.getUser();
  if (!checkId.ok) throw new Error("User not found!");

  const db = initDB(checkId.spreadsheetId, "Jadwal", 7, 2, true);
  let subjectList = db.searchAll(key);

  let finalData = [
    `Hari ini ${days[date.getDay()]} ${date.getDate()} ${
      months[date.getMonth()]
    } ${date.getFullYear()}\n`,
    `Jadwal kamu untuk hari ${key.toLowerCase()}:\n`,
  ];

  subjectList.forEach((subject) => {
    const data = subject.data;
    let useSesi = true;
    for (dataIndex in data) {
      if (dataIndex == 2 && data[2]) {
        finalData.splice(finalData.indexOf(data[0]), 0, `${data[dataIndex]}\n`);
        useSesi = false;
      } else if (dataIndex == 3 && data[3]) {
        if (useSesi) {
          const sess = data[dataIndex].match(/\d-\d\s(pagi|sore)/i)[0];
          const sessId = sess.match(/\d/gi);
          const sessPer = sess
            .match(/(pagi|sore)/i)[0]
            .replace(/\w/i, (e) => e.toUpperCase());
          let timeData = [];
          sessId.forEach((id) => {
            const sessTime = db.key(`${sessPer}-${id}`).data[2];
            const time = sessTime.match(/\d+:\d+/gi);
            time.forEach((time) => {
              timeData.push(time);
            });
          });
          finalData.splice(
            finalData.indexOf(data[0]),
            0,
            `${timeData[0]} - ${timeData[timeData.length - 1]}\n`
          );
        }
        finalData.push(`${data[dataIndex]}\n`);
      } else if (dataIndex == 0) {
        if (data[1]) finalData.push("\n---\n");
        else continue;
      } else {
        if (data[dataIndex]) {
          finalData.push(`${data[dataIndex].replaceAll(" | ", "\n")}\n`);
        } else {
          continue;
        }
      }
    }
  });

  if (finalData.length <= 2) {
    return {
      success: true,
      free: true,
      subject: `<b>Selamat liburan 😚 !</b>\nNggak ada jadwal di hari ${key}`,
    };
  } else {
    return {
      success: true,
      free: false,
      subject: finalData.join(""),
    };
  }
}

// ---------- Delete Sheets From Google Drive Functions ---------- //

function deleteStoppedSheets() {
  const ebinaDrive = new EbinaDrive();
  const deletedSheets = ebinaDrive.deleteStopped();

  let finalData = ["Menghapus sheet:\n"];
  deletedSheets.forEach((sheet) => {
    if (sheet.success) {
      finalData.push(`${sheet.name}: Berhasil\n`);
    } else {
      finalData.push(`\n${sheet.name}: Gagal\n<code>${sheet.message}</code>\n`);
    }
  });

  finalData = {
    ok: true,
    result: [...finalData],
  };

  if (finalData.result.length > 1) {
    return {
      ...finalData,
      result: finalData.result.join(""),
    };
  } else {
    return {
      ...finalData,
      result: false,
    };
  }
}
