"use strict";

const utils = require("./utils");
const fs = require("fs");
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
    return res;
    } catch (e) {
        log.error("dtsg_error_update", e);
        return res;
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
  log.log("login", `Logged in as ${userID}`);
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
    log.log('login', `Server region: ${region}`);
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

//fix this error "Please try closing and re-opening your browser window" by automatically refreshing Fb_dtsg Between 48hr or less Automatically!
let isFirstRun = true;

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

function scheduleRefresh(api) {
    log.info("login", "Automatic refresh is Enabled");

    const refreshAction = () => {
        const fbDtsgData = getFbDtsgDataFromJson(); // Get data from JSON

        if (fbDtsgData) {
            // Pass the fb_dtsg and jazoest from the JSON to refreshFb_dtsg
            api.refreshFb_dtsg(fbDtsgData)
                .then(() => log.warn("login", "Fb_dtsg refreshed successfully."))
                .catch((err) => log.error("login", "Error during Fb_dtsg refresh:", err))
                .finally(scheduleNextRefresh);
        } else {
            log.error("login", "Failed to retrieve fb_dtsg data from JSON.");
            scheduleNextRefresh();
        }
    };

    if (isFirstRun) {
        isFirstRun = false;
        refreshAction();
    } else {
        scheduleNextRefresh();
    }
}

function scheduleNextRefresh() {
    setTimeout(() => {
        refreshAction();
    }, Math.random() * 172800000);  // Refresh within a random time, up to 48 hours
}

async function loginHelper(appState, email, password, globalOptions) {
  let mainPromise = null;
  const jar = utils.getJar();
  log.log("login", 'Logging in...');
  if (appState) {
    if (utils.getType(appState) === 'Array' && appState.some(c => c.name)) {
      appState = appState.map(c => {
        c.key = c.name;
        delete c.name;
        return c;
      })
    }
    else if (utils.getType(appState) === 'String') {
      const arrayAppState = [];
      appState.split(';').forEach(c => {
        const [key, value] = c.split('=');
        arrayAppState.push({
          key: (key || "").trim(),
          value: (value || "").trim(),
          domain: ".facebook.com",
          path: "/",
          expires: new Date().getTime() + 1000 * 60 * 60 * 24 * 365
        });
      });
      appState = arrayAppState;
    }

    appState.map(c => {
      const str = c.key + "=" + c.value + "; expires=" + c.expires + "; domain=" + c.domain + "; path=" + c.path + ";";
      jar.setCookie(str, "http://" + c.domain);
    });

    // Load the main page.
    mainPromise = utils
      .get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true })
      .then(utils.saveCookies(jar));
  } else {
    if (email) {
      throw "Currently, the login method by email and password is no longer supported, please use the login method by appState";
    }
    else {
      throw "No appState given.";
    }
  }

  api = {
    setOptions: setOptions.bind(null, globalOptions),
    getAppState() {
      const appState = utils.getAppState(jar);
      return appState.filter((item, index, self) => self.findIndex((t) => { return t.key === item.key }) === index);
    }
  }


  mainPromise = mainPromise
    .then(res => bypassAutoBehavior(res, jar, globalOptions, appState))
    .then(async (res) => {
      const url = `https://www.facebook.com/home.php`;
      const php = await utils.get(url, jar, null, globalOptions);
      return php;
    })
    .then(async (res) => {
      const html = res?.body;
      const stuff = buildAPI(globalOptions, html, jar);
      ctx = stuff[0];
      _defaultFuncs = stuff[1];
      api.addFunctions = (folder) => {
        fs.readdirSync(folder)
          .filter((v) => v.endsWith('.js'))
          .map((v) => {});
      }
      api.addFunctions(__dirname + '/src/');
      api.listen = api.listenMqtt;
      return res;
    })
    .then(async (res) => {
        updateDtsg();
        return res;
    });
  if (globalOptions.pageID) {
    mainPromise = mainPromise
      .then(function() {
        return utils
          .get('https://www.facebook.com/' + ctx.globalOptions.pageID + '/messages/?section=messages&subsection=inbox', ctx.jar, null, globalOptions);
      })
      .then(function(resData) {
        let url = utils.getFrom(resData.body, 'window.location.replace("https:\\/\\/www.facebook.com\\', '");').split('\\').join('');
        url = url.substring(0, url.length - 1);
        return utils
          .get('https://www.facebook.com' + url, ctx.jar, null, globalOptions);
      });
  }

  mainPromise
    .then(async (res) => {
      const detectLocked = await checkIfLocked(res, appState);
      if (detectLocked) throw detectLocked;
      const detectSuspension = await checkIfSuspended(res, appState);
      if (detectSuspension) throw detectSuspension;
      log.log("login", "Done logging in.");
      scheduleRefresh(api);
      return callback(null, api);
    }).catch(e => callback(e));
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