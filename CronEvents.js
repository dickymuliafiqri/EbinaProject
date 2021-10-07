function remindSubjects() {
  const ebinaSheet = new EbinaSheet();
  const userList = ebinaSheet.getUsers();

  userList.forEach((user) => {
    const data = user.data;

    // Jika notifikasi dimatikan, lanjut ke pengguna berikutnya
    if (data[4] == "Off") return;

    const errorHandler = new ErrorHandler(
      undefined,
      "mengirimkan pesan pengingat jadwal",
      `Kirim pesan ke ${data[0]}`
    );

    try {
      let subject = getSubjects(data[0], days[date.getDay()]);

      // Jika hari ini libur
      if (subject.free) {
        subject = getSubjects(data[0], days[date.getDay() + 1]);

        // Jika besok tidak libur
        if (!subject.free)
          tg.kirimPesan(data[0], subject.subject, "HTML", true);
      } else {
        const timeList = subject.subject.match(/\d+:\d+/gi);
        let lastTime = 0;

        timeList.forEach((time) => {
          const timeInt = parseInt(time.replace(":", ""));
          lastTime = timeInt > lastTime ? timeInt : lastTime;
        });

        // Jika jadwal hari ini terlewat
        if (parseInt(`${date.getHours()}${date.getMinutes()}`) < lastTime) {
          tg.kirimPesan(data[0], subject.subject, "HTML", true);
        } else {
          subject = getSubjects(data[0], days[date.getDay() + 1]);
          if (!subject.free)
            tg.kirimPesan(data[0], subject.subject, "HTML", true);
        }
      }
    } catch (e) {
      if (e.message.match(/(400|403)/gi)) {
        const userSheet = new UserSheet(user.data[0]);
        try {
          userSheet.removeUser();
        } catch (e) {
          errorHandler.errorHandler(e, "menghapus pengguna");
        }
      } else {
        errorHandler.errorHandler(e);
      }
    }
  });
}

function remindNotes() {
  const ebinaSheet = new EbinaSheet();
  const userList = ebinaSheet.getUsers();

  userList.forEach((user) => {
    const data = user.data;

    // Jika notifikasi dimatikan, lanjut ke pengguna berikutnya
    if (data[4] == "Off") return;

    const errorHandler = new ErrorHandler(
      undefined,
      "mengirimkan pesan pengingat catatan",
      `Kirim pesan ke ${data[0]}`
    );

    try {
      const checkId = {
        ok: true,
        userId: data[0],
        email: data[1],
        spreadsheetId: data[2],
        spreadsheetUrl: data[3],
      };

      const notesSheet = new NotesSheet(checkId);
      const keyList = notesSheet.getNotesKey();

      if (keyList.success) {
        let finalData = "Daftar catatan kamu:";

        keyList.keyList.forEach((key) => {
          finalData += `\n- ${key}`;
        });
        tg.kirimPesan(data[0], finalData, "HTML", true);
      }
    } catch (e) {
      if (e.message.match(/400|403/gi)) {
        const userSheet = new UserSheet(user.data[0]);
        try {
          userSheet.removeUser();
        } catch (e) {
          errorHandler.errorHandler(e, "menghapus pengguna");
        }
      } else {
        errorHandler.errorHandler(e);
      }
    }
  });
}

function cronDeleteSheets() {
  const errorHandler = new ErrorHandler(undefined, "menghapus sheet");

  let deletedSheets;
  try {
    deletedSheets = deleteStoppedSheets();
  } catch (e) {
    errorHandler.errorHandler(e);
  }

  if (deletedSheets.ok && deletedSheets.result) {
    Logger.log(deletedSheets.result);
    tg.kirimPesan(groupChatID, deletedSheets.result, "HTML", true);
  }
}
