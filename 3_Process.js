// fungsi buat handle hanya menerima pesan berupa POST, kalau GET keluarkan pesan error
function doGet(e) {
  return tg.util.outputText("Hanya data POST yang kita proses yak!");
}

// fungsi buat handle pesan POST
function doPost(e) {
  // data e kita verifikasi
  var update = tg.doPost(e);

  // jika data valid proses pesan
  if (update) {
    prosesPesan(update);
  }
}

// fungsi utama untuk memproses segala pesan yang masuk
function prosesPesan(update) {
  const startTime = Date.now();
  //return tg.util.outputText("Data diterima di proses Pesan!");

  // detek klo ada pesan dari user
  if (update.message) {
    // penyederhanaan variable
    var msg = update.message;
    const msgFrom = msg.from;
    const msgChat = msg.chat;
    let isChat = false;
    let finalData;
    let finalKeyboard;

    const Keyboard = Builder.keyboard;
    const Key = Builder.key;

    // Inisialisasi error handler
    const errorHandler = new ErrorHandler(
      msgChat.id,
      "menjalankan perintah",
      msg.text
    );

    // jika ada pesan berupa text
    try {
      if (msg.text || msg.photo) {
        const userText = msg.text;

        // ------- START CHAT ACTION ------- //

        if (/^\/(img|write|onecak)(\s\w)?/i.exec(userText)) {
          tg.sendChatAction(msgChat.id, "upload_photo");
        } else {
          tg.sendChatAction(msgChat.id, "typing");
        }

        // -------- END CHAT ACTION -------- //

        // ----- START COMMAND ----- //

        if (/^\//i.exec(userText)) {
          // jika user klik start, bot akan menjawab
          if (/^\/start/i.exec(userText)) {
            finalData = start;

            finalKeyboard = Keyboard.make([
              Key.callback("Menu Utama", "menu"),
            ]).inline();
            finalKeyboard = finalKeyboard.reply_markup;
          } else if (/^\/ping/i.exec(userText)) {
            finalData = "Pong 🏓";
          } else if (/^\/commands/i.exec(userText)) {
            finalData = commands;
          } else if (/^\/short\s\w+:\/\/.+\..+/i.exec(userText)) {
            let text = userText.split(" ");
            const shortUrl = urlShortener(text[1]);

            if (shortUrl.success) {
              finalData = "Link berhasil diperpendek!\n";
              finalData += `<a href="${text[1]}">Panjang</a> | <a href="${shortUrl.result}">Pendek</a>`;
            }
          } else if (/^\/short/i.exec(userText)) {
            finalData =
              "Digunakan untuk memperpendek alamat link (Url Shortener)\n";
            finalData += "Contoh:\n<code>/short https://google.com</code>";
          } else if (/^\/curhat/i.exec(userText)) {
            isChat = true;
            const curhatIndex = Math.floor(Math.random() * curhat.length);
            finalData = getChatBotAPI(curhat[curhatIndex]);
          } else if (/^\/brain\s\w+/i.exec(userText)) {
            let text = userText.split(" ");
            text.shift();

            const customSearch = new SearchEngine(text.join(" "));
            const brainly = customSearch.brainlySearch();

            if (brainly.success && brainly.result) {
              finalData = "Hasil pencarian brainly 🧠:";

              brainly.result.forEach((brain) => {
                finalData += `\n\n---\n${tg.util.clearHTML(
                  brain.content.replaceAll(/<br(\s)?\/>/gi, "\n")
                )}\n`;
                finalData += `<a href="${brain.url}">Link pertanyaan</a>`;
              });
            } else {
              finalData =
                "Tidak ada soal yang sesuai dengan kata kunci kamu ☹️";
            }
          } else if (/^\/brain/i.exec(userText)) {
            finalData =
              "Digunakan untuk melakukan pencarian di website contekan kesayangan kita\n";
            finalData += "Contoh:\n<code>/brain Sejarah Nusantara</code>";
          } else if (/^\/go\s\w+/i.exec(userText)) {
            let text = userText.split(" ");
            text.shift();

            const customSearch = new SearchEngine(text.join(" "));
            const googleSearch = customSearch.webSearch();

            if (googleSearch.success && googleSearch.result) {
              finalData = "Hasil pencarian Google:";

              googleSearch.result.forEach((web) => {
                finalData += `\n\n<a href="${web.link}">${web.title}</a>`;
                finalData += `\n${tg.util.clearHTML(web.snippet)}`;
              });
            } else {
              finalData = "Yah, gak ada hasilnya loh 😕🔎";
            }
          } else if (/^\/go/i.exec(userText)) {
            finalData = "Digunakan untuk melakukan pencarian web\n";
            finalData += "Contoh:\n<code>/go Java Language</code>";
          } else if (/^\/img\s\w+/i.exec(userText)) {
            let text = userText.split(" ");
            text.shift();

            const customSearch = new SearchEngine(text.join(" "));
            const googleSearch = customSearch.imageSearch();

            if (googleSearch.success && googleSearch.result) {
              finalData = [...googleSearch.result];
            } else {
              finalData = "Yah, gak ada hasilnya loh 😕🔎";
            }
          } else if (/^\/img/i.exec(userText)) {
            finalData = "Digunakan untuk melakukan pencarian gambar\n";
            finalData += "Contoh:\n<code>/img Java Language</code>";
          } else if (/^\/wiki\s\w+/i.exec(userText)) {
            let text = userText.split(" ");
            text.shift();

            const customSearch = new SearchEngine(text.join(" "));
            const wikiSearch = customSearch.wikiSearch();

            if (wikiSearch.success && wikiSearch.result) {
              finalData = "Hasil pencarian wikipedia 📖:";

              wikiSearch.result.forEach((wiki) => {
                finalData += `\n\n<a href="${wiki.link}">${wiki.title}</a>`;
                if (wiki.description) finalData += `\n${wiki.description}`;
              });
            } else {
              finalData = "Ups, gak ada di wikipedia! 🤔";
            }
          } else if (/^\/wiki/i.exec(userText)) {
            finalData = "Digunakan untuk melakukan pencarian di wikipedia\n";
            finalData += "Contoh:\n<code>/wiki Java</code>";
          } else if (/^\/trt\s\w+/i.exec(userText)) {
            let text = userText.split(" ");
            text.shift();

            let trt;

            if (isoLangs[text[0].toLowerCase()]) {
              let to = text.shift();

              if (msg.reply_to_message) {
                text = msg.reply_to_message.text;
                trt = translate(text, to);
              } else {
                text = text.join(" ");
                trt = translate(text, to);
              }
            } else {
              finalData = "Kode bahasa yang kamu gunakan tidak valid!";
            }

            if (trt) {
              finalData = `Berhasil menerjemahkan dari <code>${
                isoLangs[trt.origin].name
              }</code> ke <code>${isoLangs[trt.to].name}</code>\n`;
              finalData += `\n---\n${trt.result}`;
            }
          } else if (/^\/trt/i.exec(userText)) {
            finalData = "Digunakan untuk menerjemahkan bahasa\n";
            finalData +=
              'Untuk list lengkap kode bahasa cek <a href="https://cloud.google.com/translate/docs/languages">di sini</a>\n\n';
            finalData += "Contoh:\n<code>/trt ru Tidur siang</code>";
          } else if (/^\/onecak/i.exec(userText)) {
            onecak(msgChat.id);
          } else if (/^\/write\s\w/i.exec(userText)) {
            let text = userText.split(" ");
            text.shift();

            const write = paperWrite(text.join(" "));

            if (write.success) {
              return tg.requestForm("sendPhoto", {
                chat_id: String(msgChat.id),
                photo: Utilities.newBlob(
                  Utilities.base64Decode(write.result.substr(23)),
                  "image/jpeg",
                  "Paper"
                ),
              });
            } else {
              finalData = "Terjadi kesalahan saat menulis kertas";
            }
          } else if (/^\/write/i.exec(userText)) {
            finalData = "Digunakan untuk menulis diatas kertas\n";
            finalData += "Contoh:\n<code>/write tulisan</code>";
          } else {
            finalData = unknown;
          }
        }
        // ------ END COMMAND ------ //
        else if (/^\./i.exec(userText)) {
          return;
        } else {
          if (msg.reply_to_message) {
            if (msg.reply_to_message.from.id == botID) {
              if (/Kode:\s\d+-\d{2}/gi.exec(msg.reply_to_message.text)) {
                const rawCode = /Kode:\s\d+-\d{2}/gi.exec(
                  msg.reply_to_message.text
                )[0];
                const msgCode = rawCode.match(/\d+/gim);

                if (msgFrom.id == msgCode[0]) {
                  if (/^.+@.+\.*\w+/i.exec(userText)) {
                    if (msgCode[1] == 00) {
                      const user = new EbinaSheet(msgFrom.id).getUser();

                      if (user.ok) {
                        finalData = "Akun kamu sudah terdaftar di database!";

                        finalKeyboard = Keyboard.make([
                          Key.callback("Lihat Akun", "usr/account"),
                        ]).inline();
                        finalKeyboard = finalKeyboard.reply_markup;

                        tg.deleteMessage(
                          msgChat.id,
                          msg.reply_to_message.message_id
                        );
                      } else {
                        const reg = new UserSheet(
                          msgFrom.id
                        ).createNewSpreadsheet(userText);

                        if (reg.success) {
                          tg.deleteMessage(
                            msgChat.id,
                            msg.reply_to_message.message_id
                          );

                          finalData =
                            "Yeyy, akun kamu berhasil didaftarkan! 🎉\n";
                          finalData +=
                            "\nTekan tombol di bawah untuk mulai menggunakan bot...";

                          finalKeyboard = Keyboard.make([
                            Key.callback("Menu Utama", "menu"),
                          ]).inline();
                          finalKeyboard = finalKeyboard.reply_markup;
                        }
                      }
                    } else if (msgCode[1] == 01) {
                      const email = new UserSheet(msgFrom.id).changeUserEmail(
                        userText
                      );

                      if (email.success) {
                        tg.deleteMessage(
                          msgChat.id,
                          msg.reply_to_message.message_id
                        );

                        finalData = "Email kamu berhasil diganti!\n";
                        finalData += `\nEmail lama: <code>${email.oldEmail}</code>`;
                        finalData += `\nEmail baru: <code>${email.newEmail}</code>`;

                        finalKeyboard = Keyboard.make([
                          Key.callback("Kembali", "usr/account"),
                        ]).inline();
                        finalKeyboard = finalKeyboard.reply_markup;
                      }
                    }
                  } else if (msg.photo) {
                    if (msgCode[1] == 02) {
                      const photo = msg.photo;
                      const photoID = photo[photo.length - 1].file_id;

                      const setPhoto = new UserSheet(
                        msgFrom.id
                      ).setPhotoProfile(photoID);

                      if (setPhoto.success) {
                        finalData = "Foto profil kamu berhasil dipasang!";

                        finalKeyboard = Keyboard.make([
                          Key.callback("Kembali", "usr/account"),
                        ]).inline();
                        finalKeyboard = finalKeyboard.reply_markup;

                        tg.deleteMessage(
                          msgChat.id,
                          msg.reply_to_message.message_id
                        );
                      }
                    }
                  } else if (/\w+(\s.+)?/i.exec(userText)) {
                    if (msgCode[1] >= 10 && msgCode[1] < 20) {
                      const text = userText.split(" ");
                      const key = `#${text.shift()}`;
                      const value = text.join(" ");

                      finalData = removeResponseTime(
                        msg.reply_to_message.text
                      ).split("\n\n");

                      const notesSheet = new NotesSheet(
                        new EbinaSheet(msgFrom.id).getUser()
                      );

                      switch (parseInt(msgCode[1])) {
                        case 10:
                          const setNote = notesSheet.setNote(key, value);

                          if (setNote.success) {
                            if (!finalData[2].match(key)) {
                              if (finalData[2].match(/- #.+/i))
                                finalData[2] += `\n- ${key}`;
                              else finalData.splice(2, 0, `- ${key}`);
                            } else {
                              tg.sendMsg(
                                msg,
                                `<i>Catatan ${key} berhasil diperbarui!</i>`,
                                "HTML",
                                true
                              );
                            }
                          }
                          break;
                        case 11:
                          const getNote = notesSheet.getNote(key);

                          if (getNote.success) {
                            let noteData = `----- <b>${key.replace(
                              "#",
                              ""
                            )}</b>`;
                            noteData += `\n<code>${getNote.data}</code>`;
                            noteData += "\n----------";
                            tg.sendMsg(
                              msg,
                              noteData,
                              "HTML",
                              true,
                              msg.message_id
                            );
                          }
                          break;
                        case 12:
                          const delNote = notesSheet.delNote(key);

                          if (delNote.success) {
                            finalData[2] = finalData[2].replace(
                              new RegExp(`(\n)?- ${key}`, "gi"),
                              ""
                            );
                          }
                          break;
                      }

                      finalKeyboard = msg.reply_to_message.reply_markup;
                      finalData = finalData.join("\n\n");

                      tg.deleteMessage(
                        msgChat.id,
                        msg.reply_to_message.message_id
                      );
                    }
                  }
                }
              } else {
                isChat = true;
                finalData = getChatBotAPI(userText);
              }
            }
          } else {
            isChat = true;
            finalData = getChatBotAPI(userText);
          }
        }
      }

      // ---------- MESSAGE EXECUTOR ---------- //

      if (finalData) {
        if (finalKeyboard) {
          tg.sendMsg(
            msg,
            addResponseTime(finalData, startTime),
            "HTML",
            true,
            msg.message_id,
            finalKeyboard
          );
        } else if (finalData instanceof Object) {
          let imageList = [];

          for (let imageIndex in finalData) {
            imageList.push({
              type: "photo",
              media: finalData[imageIndex].link,
            });

            if (!(imageIndex % 3) && imageIndex) {
              tg.sendMediaGroup(msgChat.id, imageList);
              imageList = [];
            }
          }
        } else {
          if (isChat) tg.sendMsg(msg, finalData, "HTML");
          else
            tg.sendMsg(
              msg,
              addResponseTime(finalData, startTime),
              "HTML",
              true,
              (reply_to_message_id = msg.message_id)
            );
        }
      }
    } catch (e) {
      errorHandler.errorHandler(e);
    }
  } else if (update.callback_query) {
    const cb = update.callback_query;
    const cbFrom = cb.from;
    const cbMessage = cb.message;
    const cbReplyTo = cb.message.reply_to_message;
    const data = cb.data;

    const Keyboard = Builder.keyboard;
    const Key = Builder.key;

    let finalData;
    let finalKeyboard;
    let finalCallbackData;
    let photoProfile;

    const errorHandler = new ErrorHandler(
      cbReplyTo.chat.id,
      "membalas callback",
      data
    );

    try {
      if (
        cbFrom.id != cbReplyTo.from.id &&
        (!/sub/i.exec(data) || /cancel$/i.exec(data))
      ) {
        tg.requestForm("answerCallbackQuery", {
          callback_query_id: cb.id,
          text: `Mau ngapain bang ? 😏`,
        });
      } else if (/menu/i.exec(data)) {
        const hours = date.getHours();

        finalData = "--- Menu Utama ---\n";
        if (hours <= 9) {
          finalData += "\nHalo selamat pagi 🌄";
        } else if (hours <= 14) {
          finalData += "\nHalo selamat siang ☀";
        } else if (hours <= 18) {
          finalData += "\nHalo selamat sore 🌆";
        } else {
          finalData += "\nHalo selamat malam 🌃";
        }
        finalData += "\nSilahkan pilih menu di bawah";

        const keyboard1 = Keyboard.make(
          [
            Key.callback("Akun", "usr/account"),
            Key.callback("Jadwal", "sub/subjects"),
          ],
          {
            colums: 2,
          }
        );
        const keyboard2 = Keyboard.make(
          [
            Key.callback("Catatan", "note/notes"),
            Key.callback("Pengaturan", "set/setting"),
          ],
          {
            colums: 2,
          }
        );
        const keyboard3 = Keyboard.make([
          Key.callback("Perintah", "commands"),
          Key.callback("Tutup", "cancel"),
        ]);

        finalKeyboard = Keyboard.combine(
          keyboard1,
          keyboard2,
          keyboard3
        ).inline();
        finalKeyboard = finalKeyboard.reply_markup;
      } else if (/Cancel$/i.exec(data)) {
        tg.deleteMessage(cbReplyTo.chat.id, cbMessage.message_id);

        finalCallbackData = "Understandable, have a great day ✌";
      } else if (/usr\//i.exec(data)) {
        const usrData = data.replace("usr/", "");

        const user = new EbinaSheet(cbReplyTo.from.id).getUser();

        if (/account$/i.exec(usrData)) {
          finalData = "--- Akun ---\n";
          if (user.ok) {
            finalData += `\nData Sheet ${cbReplyTo.from.first_name}${
              cbReplyTo.from.last_name ? ` ${cbReplyTo.from.last_name}` : ""
            }:`;
            finalData += `\nNama File: <code>Ebina-${user.userId}</code>\n`;
            finalData += `Email: <code>${user.email}</code>\n`;

            photoProfile = user.photo;

            const keyboard1 = Keyboard.make([
              Key.callback("Ganti Email", "usr/emailChange"),
              Key.url("Rubah Jadwal", user.spreadsheetUrl),
            ]);
            const keyboard2 = Keyboard.make([
              Key.callback("Pasang Foto", "usr/photoSet"),
              user.photo
                ? Key.callback("Hapus Foto", "usr/photoDelete")
                : Key.callback("Hapus Foto", "usr/photoDelete", true),
            ]);
            const keyboard3 = Keyboard.make([
              Key.callback("Kembali", "menu"),
              Key.callback("Hapus Akun", "usr/delete"),
            ]);

            finalKeyboard = Keyboard.combine(
              keyboard1,
              keyboard2,
              keyboard3
            ).inline();
            finalKeyboard = finalKeyboard.reply_markup;
          } else {
            finalData = "--- Registrasi Akun ---\n";
            finalData +=
              "\nHalo, kalo kamu pingin pake fitur keren bot ini, kamu harus daftar dulu.\n";
            finalData +=
              "<i>Caranya, cukup balas pesan ini pake email kamu.</i>\n";
            finalData += "\nTerimakasih 👩‍🎓\n";
            finalData += `\nKode: <code>${cbReplyTo.from.id}-00</code>`;

            finalKeyboard = Keyboard.make([
              Key.callback("Kembali", "menu"),
            ]).inline();
            finalKeyboard = finalKeyboard.reply_markup;
          }
        } else if (/photoSet$/i.exec(usrData)) {
          finalData = "--- Pasang Foto Profil ---\n";
          finalData += "\nUntuk menggunakan/mengganti foto profil";
          finalData += "\nBalas pesan ini dengan foto yang ingin kamu pake\n";
          finalData += "\n<i>Jangan kirim sebagai dokumen!</i>\n";
          finalData += `\nKode: <code>${cbReplyTo.from.id}-02</code>`;

          finalKeyboard = Keyboard.make([
            Key.callback("Kembali", "usr/account"),
          ]).inline();
          finalKeyboard = finalKeyboard.reply_markup;
        } else if (/photoDelete$/i.exec(usrData)) {
          if (user.photo) {
            finalData = "--- Hapus Foto Profil ---\n";
            finalData += "\nBeneran mau hapus foto profil kamu ?";

            finalKeyboard = Keyboard.make([
              Key.callback("Iya", "usr/photoDeleteDo"),
              Key.callback("Enggak", "usr/account"),
            ]).inline();
            finalKeyboard = finalKeyboard.reply_markup;
          } else {
            finalCallbackData = "Kamu belum memasang foto profil!";
          }
        } else if (/photoDeleteDo$/i.exec(usrData)) {
          const photoDel = new UserSheet(cbReplyTo.from.id).setPhotoProfile(
            null
          );

          if (photoDel.success) {
            finalData = "Foto profil berhasil dihapus!";

            finalKeyboard = Keyboard.make([
              Key.callback("Kembali", "usr/account"),
            ]).inline();
            finalKeyboard = finalKeyboard.reply_markup;
          }
        } else if (/emailChange$/i.exec(usrData)) {
          finalData = "--- Ganti Email ---\n";
          finalData += "\nOke, kamu mau ganti email yaa ?\n";
          finalData +=
            "Untuk ganti email, balas pesan ini dengan email baru kamu ✉️\n";
          finalData += `\nKode: <code>${cbReplyTo.from.id}-01</code>`;

          finalKeyboard = Keyboard.make([
            Key.callback("Kembali", "usr/account"),
          ]).inline();
          finalKeyboard = finalKeyboard.reply_markup;
        } else if (/delete$/i.exec(usrData)) {
          finalData = "--- Hapus Akun ---\n";
          finalData += "\nAkun kamu beneran mau dihapus ? 🥺";

          finalKeyboard = Keyboard.make([
            Key.callback("Iyalah 👿", "usr/deleteAccountDo"),
            Key.callback("Enggak Kok 😇", "usr/account"),
          ]).inline();
          finalKeyboard = finalKeyboard.reply_markup;
        } else if (/deleteAccountDo$/i.exec(usrData)) {
          const userDelete = new UserSheet(cbReplyTo.from.id).removeUser();

          if (userDelete.success) {
            finalData =
              "Data kamu berhasil dihapus sementara dan masih dapat diakses\n";
            finalData +=
              "<i>Sistem akan menghapusnya dengan permanen dalam beberapa jam</i> 🧹";

            finalKeyboard = Keyboard.make([
              Key.url("Amankan Sebelum Hilang 😱", userDelete.url),
            ]).inline();
            finalKeyboard = finalKeyboard.reply_markup;
          }
        }
      } else if (/set\//i.exec(data)) {
        const setData = data.replace("set/", "");

        const user = new EbinaSheet(cbReplyTo.from.id).getUser();

        finalData = "--- Pengaturan ---\n";
        finalData += `\nPengingat: ${user.reminder}`;

        const remind = user.reminder == "Off";

        const keyboard1 = Keyboard.make([
          Key.callback(
            remind ? "Hidupkan Pengingat" : "Matikan Pengingat",
            remind ? "rmd/On" : "rmd/Off"
          ),
        ]);
        const keyboard2 = Keyboard.make([Key.callback("Kembali", "menu")]);
        finalKeyboard = Keyboard.combine(keyboard1, keyboard2).inline();
        finalKeyboard = finalKeyboard.reply_markup;
      } else if (/rmd\//i.exec(data)) {
        const rmdData = data.replace("rmd/", "");

        if (/(On|Off)$/i.exec(rmdData)) {
          const remind = new UserSheet(cbReplyTo.from.id).toggleReminder(
            rmdData
          );

          if (remind.success) {
            finalData = removeResponseTime(cbMessage.text).replace(
              `Pengingat: ${rmdData == "On" ? "Off" : "On"}`,
              `Pengingat: ${rmdData}`
            );
            finalData.match(/:\s.+/gim).forEach((m) => {
              finalData = finalData.replace(
                m,
                `: <code>${m.replace(": ", "")}</code>`
              );
            });

            if (remind.reminder == "On")
              finalCallbackData = "Pengingat dihidupkan 🔔";
            else finalCallbackData = "Pengingat dimatikan 🔕";

            finalKeyboard = cbMessage.reply_markup;
            finalKeyboard.inline_keyboard[0][0] = {
              text:
                remind.reminder == "Off"
                  ? "Hidupkan Pengingat"
                  : "Matikan Pengingat",
              callback_data: remind.reminder == "Off" ? "rmd/On" : "rmd/Off",
            };
          } else {
            finalCallbackData = remind.message;
          }
        }
      } else if (/sub/i.exec(data)) {
        const subData = data.replace("sub/", "");

        finalData = "--- Jadwal ---\n";
        if (/subjects$/i.exec(subData)) {
          const key = days[date.getDay()];
          const now = getSubjects(cbReplyTo.from.id, key);

          if (now.success) {
            finalData += `\n${now.subject}`;

            const keyboard1 = Keyboard.make(
              [
                Key.callback("Senin", "sub/Senin"),
                Key.callback("Selasa", "sub/Selasa"),
              ],
              {
                colums: 2,
              }
            );
            const keyboard2 = Keyboard.make(
              [
                Key.callback("Rabu", "sub/Rabu"),
                Key.callback("Kamis", "sub/Kamis"),
              ],
              {
                colums: 2,
              }
            );
            const keyboard3 = Keyboard.make(
              [
                Key.callback("Jumat", "sub/Jumat"),
                Key.callback("Sabtu", "sub/Sabtu"),
              ],
              {
                colums: 2,
              }
            );
            const keyboard4 = Keyboard.make([
              Key.callback("Minggu", "sub/Minggu"),
              Key.callback("Kembali", "menu"),
            ]);

            finalKeyboard = Keyboard.combine(
              keyboard1,
              keyboard2,
              keyboard3,
              keyboard4
            ).inline();
            finalKeyboard = finalKeyboard.reply_markup;
          }
        } else {
          const subjects = getSubjects(cbReplyTo.from.id, subData);
          if (subjects.success) {
            finalData = subjects.subject;

            finalKeyboard = cbMessage.reply_markup;
          }
        }
      } else if (/note/i.exec(data)) {
        const noteData = data.replace("note/", "");

        finalData = "--- Catatan ---\n";
        if (/notes/i.exec(noteData)) {
          const notes = new NotesSheet(
            new EbinaSheet(cbReplyTo.from.id).getUser()
          ).getNotesKey();

          finalData += "\nDaftar catatan kamu\n";
          if (notes.success)
            notes.keyList.forEach((key) => {
              finalData += `\n- ${key}`;
            });
          const keyboard1 = Keyboard.make([
            Key.callback("Buat", "note/set"),
            Key.callback("Ambil", "note/get"),
            Key.callback("Hapus", "note/del"),
          ]);
          const keyboard2 = Keyboard.make([Key.callback("Kembali", "menu")]);
          finalKeyboard = Keyboard.combine(keyboard1, keyboard2).inline();
          finalKeyboard = finalKeyboard.reply_markup;
        }

        if (/(set|get|del)$/i.exec(noteData)) {
          finalData = `${removeResponseTime(cbMessage.text)}\n`;

          finalKeyboard = Keyboard.make([
            Key.callback("Kembali", "note/notes"),
          ]).inline();
          finalKeyboard = finalKeyboard.reply_markup;
        }

        if (/set$/i.exec(noteData)) {
          finalData +=
            "\nUntuk membuat atau merubah catatan, balas pesan ini dengan format:\n";
          finalData += "<code>NAMA ISI</code>\n";

          finalData += `\nKode: <code>${cbReplyTo.from.id}-10</code>`;
        } else if (/get$/i.exec(noteData)) {
          finalData +=
            "\nOke, balas pesan ini dengan nama catatan yang ingin kamu lihat.\n";

          finalData += `\nKode: <code>${cbReplyTo.from.id}-11</code>`;
        } else if (/del$/i.exec(noteData)) {
          finalData += "\nApa nama catatan yang ingin kamu hapus ?\n";

          finalData += `\nKode: <code>${cbReplyTo.from.id}-12</code>`;
        }
      } else if (/commands/i.exec(data)) {
        finalData = commands;

        finalKeyboard = Keyboard.make([
          Key.callback("Kembali", "menu"),
        ]).inline();
        finalKeyboard = finalKeyboard.reply_markup;
      }

      if (finalCallbackData)
        tg.requestForm("answerCallbackQuery", {
          callback_query_id: cb.id,
          text: finalCallbackData,
        });

      if (finalData) {
        finalData = finalData.replace(
          /\w+(\s\w+)*/i,
          (title) => `<b>${title}</b>`
        );
        if (finalKeyboard) {
          if (photoProfile) {
            tg.deleteMessage(cbReplyTo.chat.id, cbMessage.message_id);
            tg.sendPhoto(
              cbReplyTo.chat.id,
              photoProfile,
              addResponseTime(finalData, startTime),
              "HTML",
              true,
              cbReplyTo.message_id,
              finalKeyboard
            );
          } else {
            if (cbMessage.photo) {
              tg.deleteMessage(cbReplyTo.chat.id, cbMessage.message_id);
              tg.sendMessage(
                cbReplyTo.chat.id,
                addResponseTime(finalData, startTime),
                "HTML",
                true,
                true,
                cbReplyTo.message_id,
                finalKeyboard
              );
            } else {
              tg.editMessageText(
                cbReplyTo.chat.id,
                cbMessage.message_id,
                null,
                addResponseTime(finalData, startTime),
                "HTML",
                true,
                finalKeyboard
              );
            }
          }
        } else {
          if (cbMessage.photo) {
            tg.deleteMessage(cbReplyTo.chat.id, cbMessage.message_id);
            tg.sendMessage(
              cbReplyTo.chat.id,
              addResponseTime(finalData, startTime),
              "HTML",
              true,
              true,
              cbReplyTo.message_id,
              finalKeyboard
            );
          } else {
            tg.editMessageText(
              cbReplyTo.chat.id,
              cbMessage.message_id,
              null,
              addResponseTime(finalData, startTime),
              "HTML",
              true
            );
          }
        }
      }
    } catch (e) {
      errorHandler.errorHandler(e);
    }
  }
}
