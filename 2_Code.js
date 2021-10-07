var tg = new telegram.daftar();
tg.setToken(botToken);

function setWebhook() {
  var r = tg.setWebhook(webhookUrl);
  Logger.log(r);
}

function getMe() {
  var me = tg.getMe();
  Logger.log(me);
  return me;
}

function getWebhookInfo() {
  var r = tg.getWebhookInfo();
  Logger.log(r);
  return r;
}

function deleteWebhook() {
  var r = tg.deleteWebhook();
  Logger.log(r);
  return r;
}
