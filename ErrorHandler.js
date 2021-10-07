class ErrorHandler {
  constructor(chatId = groupChatID, event, userText = "Kesalahan sistem") {
    this.chatId = chatId;
    this.event = event;
    this.userText = userText;
  }

  errorHandler(err, event = this.event) {
    let traceback = `Terjadi kesalahan saat ${event}!\n`;
    traceback += `Waktu: ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.toDateString()}\n`;
    traceback += `Penyebab: ${this.userText}\n\n`;
    traceback += "----- BEGIN TRACEBACK -----";
    traceback += `\n\n${err.stack}\n\n`;
    traceback += "------ END TRACEBACK ------";

    Logger.log(traceback);

    if (this.chatId == groupChatID)
      return this.errorDocumentSender(traceback, event);
  }

  errorDocumentSender(message, event) {
    const log = tg.util.textBlob(message, "log");
    return tg.requestForm("sendDocument", {
      chat_id: String(this.chatId),
      document: log,
      caption: `Terjadi kesalahan saat ${event}!`,
    });
  }
}
