"use strict";

const utils = require("./utils");
const fs = require("fs");
const log = require("npmlog");

const errorRetrieving = "Error retrieving userID. This can be caused by a lot of things, including getting blocked by Facebook for logging in from an unknown location. Try logging in with a browser to verify.";

async function setOptions(globalOptions, options = {}) {
  Object.entries(options).forEach(([key, value]) => {
    switch (key) {
      case 'proxy':
        if (typeof value !== "string") {
          delete globalOptions.proxy;
          utils.setProxy();
        } else {
          globalOptions.proxy = value;
          utils.setProxy(globalOptions.proxy);
        }
        break;
      case 'pageID':
        globalOptions.pageID = value.toString();
        break;
      default:
        globalOptions[key] = typeof value === 'boolean' ? Boolean(value) : value;
        break;
    }
  });
}

async function updateDtsg(resp) {
  try {
    const fb_dtsg = utils.getFrom(resp.body, '["DTSGInitData",[],{"token":"', '","');
    const jazoest = utils.getFrom(resp.body, 'jazoest=', '",');
    const data = { fb_dtsg, jazoest };
    fs.writeFileSync('fb_dtsg_data.json', JSON.stringify(data, null, 2), 'utf8');
    return data;
  } catch (e) {
    log.error("dtsg_error_update", e);
    return { error: "Failed to update DTSG" };
  }
}

let isBehavior = false;
async function bypassAutoBehavior(resp, jar, globalOptions, appstate, ID) {
  try {
    const UID = ID || appstate.find(c => c.key === 'c_user')?.value;
    const FormBypass = {
      av: UID,
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "FBScrapingWarningMutation",
      variables: JSON.stringify({}),
      server_timestamps: true,
      doc_id: 6339492849481770
    };
    if (resp && resp.request.uri?.href.includes("https://www.facebook.com/checkpoint/") && resp.request.uri.href.includes('601051028565049')) {
      const fb_dtsg = utils.getFrom(resp.body, '["DTSGInitData",[],{"token":"', '","');
      const jazoest = utils.getFrom(resp.body, 'jazoest=', '",');
      const lsd = utils.getFrom(resp.body, "[\"LSD\",[],{\"token\":\"", "\"}");
      await utils.post("https://www.facebook.com/api/graphql/", jar, { ...FormBypass, fb_dtsg, jazoest, lsd }, globalOptions);
      if (!isBehavior) isBehavior = true;
      return resp;
    }
    return resp;
  } catch (e) {
    log.error("error", e);
  }
}

async function checkIfSuspended(resp, appstate) {
  const UID = appstate.find(c => c.key === 'c_user')?.value;
  if (resp?.request.uri?.href.includes("https://www.facebook.com/checkpoint/") && resp.body?.match(/"log_out_uri":"(.*?)","title":"(.*?)"/)) {
    const suspendReason = resp.body.match(/"reason_section_body":"(.*?)"/);
    log.error(`Alert on ${UID}: Account suspended for:`, suspendReason[1]);
    return { suspended: true, suspendReasons: { longReason: suspendReason[1] } };
  }
}

async function checkIfLocked(resp, appstate) {
  const UID = appstate.find(c => c.key === 'c_user')?.value;
  if (resp?.request.uri?.href.includes("https://www.facebook.com/checkpoint/") && resp.body.match(/"is_unvetted_flow":true,"title":"(.*?)"/)) {
    const lockReason = resp.body.match(/"is_unvetted_flow":true,"title":"(.*?)"/)[1];
    log.error(`Alert on ${UID}: Account locked due to:`, lockReason);
    return { locked: true, lockedReasons: { reason: lockReason } };
  }
}

function buildAPI(globalOptions, html, jar) {
  const maybeCookie = jar.getCookies("https://www.facebook.com").find(val => val.cookieString().split("=")[0] === "c_user");
  if (!maybeCookie) throw errorRetrieving;

  const userID = maybeCookie.cookieString().split("=")[1];
  log.info("login", `Logged in as ${userID}`);

  const tokenMatch = html.match(/DTSGInitialData.*?token":"(.*?)"/);
  const fb_dtsg = tokenMatch ? tokenMatch[1] : null;
  const ctx = { userID, jar, globalOptions, loggedIn: true, fb_dtsg };
  return [ctx, utils.makeDefaults(html, userID, ctx)];
}

function getFbDtsgDataFromJson() {
  try {
    return JSON.parse(fs.readFileSync('fb_dtsg_data.json', 'utf8'));
  } catch (err) {
    log.error("login", "Error reading or parsing fb_dtsg_data.json:", err);
    return null;
  }
}

async function loginHelper(appState, globalOptions, callback) {
  const jar = utils.getJar();
  if (appState) {
    appState.forEach(c => jar.setCookie(`${c.key}=${c.value}; expires=${c.expires}; domain=${c.domain}; path=${c.path}`, `http://${c.domain}`));
    const res = await utils.get('https://www.facebook.com/', jar, null, globalOptions);
    await bypassAutoBehavior(res, jar, globalOptions, appState);
    const fb_dtsgData = await updateDtsg(res);
    const html = (await utils.get('https://www.facebook.com/home.php', jar)).body;
    const [ctx, defaultFuncs] = buildAPI(globalOptions, html, jar);
    return { ctx, defaultFuncs };
  } else {
    throw "No appState given.";
  }
}

async function login(loginData, options = {}, callback) {
  const globalOptions = { ...{
    selfListen: false, listenEvents: true, listenTyping: false, updatePresence: false, autoReconnect: true, online: true, emitReady: false, userAgent: "Mozilla/5.0"
  }, ...options };

  setOptions(globalOptions, options);
  try {
    const { ctx, defaultFuncs } = await loginHelper(loginData?.appState, globalOptions);
    callback(null, { ctx, defaultFuncs });
  } catch (error) {
    callback(error);
  }
}

module.exports = login;
