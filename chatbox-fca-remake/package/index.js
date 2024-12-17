"use strict";

const utils = require("./utils");
const fs = require("fs");
const log = require("npmlog");
let checkVerified = null;
let ctx = null;
let _defaultFuncs = null;
let api = null;

const errorRetrieving = "Error retrieving userID. This can be caused by a lot of things, including getting blocked by Facebook for logging in from an unknown location. Try logging in with a browser to verify.";

async function setOptions(globalOptions, options = {}) {
  Object.keys(options).map(function(key) {
    switch (key) {
      case 'online':
        globalOptions.online = Boolean(options.online);
        break;
      case 'selfListen':
        globalOptions.selfListen = Boolean(options.selfListen);
        break;
      case 'selfListenEvent':
        globalOptions.selfListenEvent = options.selfListenEvent;
        break;
      case 'listenEvents':
        globalOptions.listenEvents = Boolean(options.listenEvents);
        break;
      case 'pageID':
        globalOptions.pageID = options.pageID.toString();
        break;
      case 'updatePresence':
        globalOptions.updatePresence = Boolean(options.updatePresence);
        break;
      case 'forceLogin':
        globalOptions.forceLogin = Boolean(options.forceLogin);
        break;
      case 'userAgent':
        globalOptions.userAgent = options.userAgent;
        break;
      case 'autoMarkDelivery':
        globalOptions.autoMarkDelivery = Boolean(options.autoMarkDelivery);
        break;
      case 'autoMarkRead':
        globalOptions.autoMarkRead = Boolean(options.autoMarkRead);
        break;
      case 'listenTyping':
        globalOptions.listenTyping = Boolean(options.listenTyping);
        break;
      case 'proxy':
        if (typeof options.proxy != "string") {
          delete globalOptions.proxy;
          utils.setProxy();
        } else {
          globalOptions.proxy = options.proxy;
          utils.setProxy(globalOptions.proxy);
        }
        break;
      case 'autoReconnect':
        globalOptions.autoReconnect = Boolean(options.autoReconnect);
        break;
      case 'emitReady':
        globalOptions.emitReady = Boolean(options.emitReady);
        break;
      default:
        break;
    }
  });
}

async function updateDtsg(resp) {
    
    try {
     const fb_dtsg = utils.getFrom(resp.body, '["DTSGInitData",[],{"token":"', '","');
    const jazoest = utils.getFrom(resp.body, 'jazoest=', '",');
    
    const data = {
        fb_dtsg: fb_dtsg,
        jazoest: jazoest
    };

    const jsonData = JSON.stringify(data, null, 2);

    fs.writeFileSync('fb_dtsg_data.json', jsonData, 'utf8');
    } catch (e) {
        log.error("dtsg_error_update", e);
    }
}

let isBehavior = false;
async function bypassAutoBehavior(resp, jar, globalOptions, appstate, ID) {
  try {
    const appstateCUser = (appstate.find(i => i.key == 'c_user') || appstate.find(i => i.key == 'i_user'))
    const UID = ID || appstateCUser.value;
    const FormBypass = {
      av: UID,
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "FBScrapingWarningMutation",
      variables: JSON.stringify({}),
      server_timestamps: true,
      doc_id: 6339492849481770
    }
    const kupal = () => {
      log.warn(`login | ${UID}`, "We suspect automated behavior on your account.");
      if (!isBehavior) isBehavior = true;
    };
    if (resp) {
      if (resp.request.uri && resp.request.uri.href.includes("https://www.facebook.com/checkpoint/")) {
        if (resp.request.uri.href.includes('601051028565049')) {
          const fb_dtsg = utils.getFrom(resp.body, '["DTSGInitData",[],{"token":"', '","');
          const jazoest = utils.getFrom(resp.body, 'jazoest=', '",');
          const lsd = utils.getFrom(resp.body, "[\"LSD\",[],{\"token\":\"", "\"}");
          return utils.post("https://www.facebook.com/api/graphql/", jar, {
            ...FormBypass,
            fb_dtsg,
            jazoest,
            lsd
          }, globalOptions).then(utils.saveCookies(jar)).then(res => {
            kupal();
            return res;
          });
        } else return resp;
      } else return resp;
    }
  } catch (e) {
    log.error("error", e);
  }
}

async function checkIfSuspended(resp, appstate) {
  try {
    const appstateCUser = (appstate.find(i => i.key == 'c_user') || appstate.find(i => i.key == 'i_user'))
    const UID = appstateCUser?.value;
    const suspendReasons = {};
    if (resp) {
      if (resp.request.uri && resp.request.uri.href.includes("https://www.facebook.com/checkpoint/")) {
        if (resp.request.uri.href.includes('1501092823525282')) {
          const daystoDisable = resp.body?.match(/"log_out_uri":"(.*?)","title":"(.*?)"/);
          if (daystoDisable && daystoDisable[2]) {
            suspendReasons.durationInfo = daystoDisable[2];
            log.error(`Suspension time remaining:`, suspendReasons.durationInfo);
          }
          const reasonDescription = resp.body?.match(/"reason_section_body":"(.*?)"/);
          if (reasonDescription && reasonDescription[1]) {
            suspendReasons.longReason = reasonDescription?.[1];
            const reasonReplace = suspendReasons?.longReason?.toLowerCase()?.replace("your account, or activity on it, doesn't follow our community standards on ", "");
            suspendReasons.shortReason = reasonReplace?.substring(0, 1).toUpperCase() + reasonReplace?.substring(1);
            log.error(`Alert on ${UID}:`, `Account has been suspended!`);
            log.error(`Why suspended:`, suspendReasons.longReason)
            log.error(`Reason on suspension:`, suspendReasons.shortReason);
          }
          ctx = null;
          return {
            suspended: true,
            suspendReasons
          }
        }
      } else return;
    }
  } catch (error) {
    return;
  }
}

async function checkIfLocked(resp, appstate) {
  try {
    const appstateCUser = (appstate.find(i => i.key == 'c_user') || appstate.find(i => i.key == 'i_user'))
    const UID = appstateCUser?.value;
    const lockedReasons = {};
    if (resp) {
      if (resp.request.uri && resp.request.uri.href.includes("https://www.facebook.com/checkpoint/")) {
        if (resp.request.uri.href.includes('828281030927956')) {
          const lockDesc = resp.body.match(/"is_unvetted_flow":true,"title":"(.*?)"/);
          if (lockDesc && lockDesc[1]) {
            lockedReasons.reason = lockDesc[1];
            log.error(`Alert on ${UID}:`, lockedReasons.reason);
          }
          ctx = null;
          return {
            locked: true,
            lockedReasons
          }
        }
      } else return;
    }
  } catch (e) {
    log.error("error", e);
  }
}


function buildAPI(globalOptions, html, jar) {
  const maybeCookie = jar.getCookies("https://www.facebook.com").filter(function(val) {
    return val.cookieString().split("=")[0] === "c_user";
  });

  const objCookie = jar.getCookies("https://www.facebook.com").reduce(function(obj, val) {
    obj[val.cookieString().split("=")[0]] = val.cookieString().split("=")[1];
    return obj;
  }, {});

  if (maybeCookie.length === 0) {
    throw errorRetrieving;
  }

  if (html.indexOf("/checkpoint/block/?next") > -1) {
    log.warn("login", "Checkpoint detected. Please log in with a browser to verify.");
  }

  const userID = maybeCookie[0].cookieString().split("=")[1].toString();
  const i_userID = objCookie.i_user || null;
  log.info("login", `Logged in as ${userID}`);
  try { clearInterval(checkVerified); } catch (_) {}
  const clientID = (Math.random() * 2147483648 | 0).toString(16);
  const oldFBMQTTMatch = html.match(/irisSeqID:"(.+?)",appID:219994525426954,endpoint:"(.+?)"/);
  let mqttEndpoint, region, fb_dtsg, irisSeqID;
  try {
    const endpointMatch = html.match(/"endpoint":"([^"]+)"/);
    if (endpointMatch) {
      mqttEndpoint = endpointMatch[1].replace(/\\\//g, '/');
      const url = new URL(mqttEndpoint);
      region = url.searchParams.get('region')?.toUpperCase() || "PRN";
    }
    log.info('login', `Server region: ${region}`);
  } catch (e) {
    log.warn('login', 'Not MQTT endpoint');
  }
  const tokenMatch = html.match(/DTSGInitialData.*?token":"(.*?)"/);
  if (tokenMatch) {
    fb_dtsg = tokenMatch[1];
  }

  // All data available to api functions
  const ctx = {
    userID,
    jar,
    clientID,
    globalOptions,
    loggedIn: true,
    access_token: 'NONE',
    clientMutationId: 0,
    mqttClient: undefined,
    lastSeqId: irisSeqID,
    syncToken: undefined,
    mqttEndpoint,
    wsReqNumber: 0,
    wsTaskNumber: 0,
    reqCallbacks: {},
    region,
    firstListen: true,
    fb_dtsg
  };

  const defaultFuncs = utils.makeDefaults(html, i_userID || userID, ctx);
  return [ctx, defaultFuncs];
}
// Read the data from the JSON file
function getFbDtsgDataFromJson() {
    try {
        const data = fs.readFileSync('fb_dtsg_data.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        log.error("login", "Error reading or parsing fb_dtsg_data.json:", err);
        return null;
    }
}


async function loginHelper(appState, email, password, globalOptions, callback) {
  const jar = utils.getJar();
  log.info("login", 'Logging in...');
  
  if (appState) {
    // Handling appState as Array or String
    if (utils.getType(appState) === 'Array' && appState.some(c => c.name)) {
      appState = appState.map(c => {
        c.key = c.name;
        delete c.name;
        return c;
      });
    } else if (utils.getType(appState) === 'String') {
      const arrayAppState = appState.split(';').map(c => {
        const [key, value] = c.split('=');
        return {
          key: (key || "").trim(),
          value: (value || "").trim(),
          domain: ".facebook.com",
          path: "/",
          expires: new Date().getTime() + 1000 * 60 * 60 * 24 * 365
        };
      });
      appState = arrayAppState;
    }

    // Set cookies in the jar
    appState.forEach(c => {
      const str = `${c.key}=${c.value}; expires=${c.expires}; domain=${c.domain}; path=${c.path};`;
      jar.setCookie(str, `http://${c.domain}`);
    });

    // Load the main page
    try {
      await utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true });
      utils.saveCookies(jar);
    } catch (error) {
      throw new Error('Error loading Facebook main page: ' + error.message);
    }
  } else {
    if (email) {
      throw new Error("Currently, the login method by email and password is no longer supported. Please use the login method by appState.");
    } else {
      throw new Error("No appState given.");
    }
  }

  const api = {
    setOptions: setOptions.bind(null, globalOptions),
    getAppState() {
      const appState = utils.getAppState(jar);
      return appState.filter((item, index, self) => self.findIndex((t) => t.key === item.key) === index);
    }
  };

  try {
    let res = await bypassAutoBehavior(await utils.get('https://www.facebook.com/home.php', jar, null, globalOptions), jar, globalOptions, appState);
    const php = await utils.get('https://www.facebook.com/home.php', jar, null, globalOptions);
    const html = php?.body;
    const [ctx, _defaultFuncs] = buildAPI(globalOptions, html, jar);
    
    api.addFunctions = (folder) => {
      fs.readdirSync(folder)
        .filter((v) => v.endsWith('.js'))
        .map((v) => {});
    };
    api.addFunctions(__dirname + '/src/');
    api.listen = api.listenMqtt;

    updateDtsg(php);
    
    if (globalOptions.pageID) {
      res = await utils.get(`https://www.facebook.com/${ctx.globalOptions.pageID}/messages/?section=messages&subsection=inbox`, ctx.jar, null, globalOptions);
      let url = utils.getFrom(res.body, 'window.location.replace("https://www.facebook.com\\', '");').split('\\').join('');
      url = url.substring(0, url.length - 1);
      await utils.get(`https://www.facebook.com${url}`, ctx.jar, null, globalOptions);
    }

    const detectLocked = await checkIfLocked(res, appState);
    if (detectLocked) throw detectLocked;

    const detectSuspension = await checkIfSuspended(res, appState);
    if (detectSuspension) throw detectSuspension;

    log.info("login", "Done logging in.");
    const fbDtsgData = getFbDtsgDataFromJson();
            if (fbDtsgData) {
            api.refreshFb_dtsg(fbDtsgData)
                .then(() => log.warn("login", "Fb_dtsg refreshed successfully."))
                .catch((err) => log.error("login", "Error during Fb_dtsg refresh:", err))
        } else {
            log.error("login", "Failed to retrieve fb_dtsg data from JSON.");
        }
    if (callback && typeof callback === 'function') {
      callback(null, api);
    } else {
      return api;
    }
  } catch (e) {
    if (callback && typeof callback === 'function') {
      callback(e);
    } else {
      throw e;
    }
  }
}


async function login(loginData, options, callback) {
  if (utils.getType(options) === 'Function' ||
    utils.getType(options) === 'AsyncFunction') {
    callback = options;
    options = {};
  }
  const globalOptions = {
    selfListen: false,
    selfListenEvent: false,
    listenEvents: true,
    listenTyping: false,
    updatePresence: false,
    forceLogin: false,
    autoMarkDelivery: false,
    autoMarkRead: true,
    autoReconnect: true,
    online: true,
    emitReady: false,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.7; rv:132.0) Gecko/20100101 Firefox/132.0"
  };

  setOptions(globalOptions, options);
  const hajime = {
    relogin() {
      loginBox();
    }
  }

  async function loginBox() {
    loginHelper(loginData?.appState, loginData?.email, loginData?.password, globalOptions, hajime,
      (loginError, loginApi) => {
        if (loginError) {
          if (isBehavior) {
            log.warn("login", "Failed after dismiss behavior, will relogin automatically...");
            isBehavior = false;
            loginws3();
          }
          log.error("login", loginError);
          return callback(loginError);
        }
        callback(null, loginApi);
      });
  }
  const loginResult = await loginBox();
  return loginResult;
}

module.exports = login;