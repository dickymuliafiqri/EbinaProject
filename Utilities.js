function addResponseTime(text, startTime) {
  const responseTime = `${text}\n\n⏱️ ${Date.now() - startTime} ms`;
  return responseTime;
}

function removeResponseTime(text) {
  const responseTime = text.split("\n\n");
  responseTime.pop();

  return responseTime.join("\n\n");
}

function onecak(chatId) {
  let url = `${onecakUrl}?shuffle=1`;

  let req = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
  });
  let res = JSON.parse(req.getContentText());
  UrlFetchApp.fetch(res.posts[0].url);

  const photo = UrlFetchApp.fetch(res.posts[0].src).getBlob();
  tg.requestForm("sendPhoto", {
    chat_id: String(chatId),
    photo,
    caption: res.posts[0].title,
  });
}

function urlShortener(url) {
  const options = {
    method: "POST",
    payload: {
      url,
    },
    muteHttpExceptions: true,
  };

  const res = UrlFetchApp.fetch(cleanURIUrl, options);
  const resJson = JSON.parse(res.getContentText());

  if (resJson.error) {
    throw new Error(resJson.error);
  } else {
    return {
      success: true,
      result: resJson.result_url,
    };
  }
}

function translate(text, to) {
  const url = `${translateUrl}?engine=google&text=${encodeURI(text)}&to=${to}`;

  const req = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
  });

  const res = JSON.parse(req.getContentText());

  if (res.status) {
    return {
      success: true,
      result: res.data.result,
      origin: res.data.origin,
      to,
    };
  } else {
    throw new Error(res.data.error);
  }
}

function paperWrite(text) {
  const url = `${paperWriteUrl}?text=${text}`;

  const req = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
  });
  const res = JSON.parse(req.getContentText());

  if (res.hasil) {
    return {
      success: true,
      result: res.hasil,
    };
  }
}

function getChatBotAPI(text) {
  // Get API
  const data = JSON.parse(
    UrlFetchApp.fetch(
      `${chatBotUrl}?text=${encodeURI(text)}&lc=id`
    ).getContentText()
  );

  // Return result
  return data.success;
}
