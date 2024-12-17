"use strict";

const utils = require("./utils");
const log = require("npmlog");
const fs = require('fs');
const path = require('path');

let checkVerified = null;

const defaultLogRecordSize = 100;
log.maxRecordSize = defaultLogRecordSize;

function setOptions(globalOptions, options) {
	Object.keys(options).map(function (key) {
		switch (key) {
            case 'online':
                globalOptions.online = Boolean(options.online);
                break;
			case 'logLevel':
				log.level = options.logLevel;
				globalOptions.logLevel = options.logLevel;
				break;
			case 'logRecordSize':
				log.maxRecordSize = options.logRecordSize;
				globalOptions.logRecordSize = options.logRecordSize;
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
				log.warn("setOptions", "Unrecognized option given to setOptions: " + key);
				break;
		}
	});
}

let isBehavior = false;
async function bypassAutoBehavior(resp, jar, globalOptions, appstate, ID) {
  try {
      const fb_dtsg = utils.getFrom(resp.body, '["DTSGInitData",[],{"token":"', '","');
    const jazoest = utils.getFrom(resp.body, 'jazoest=', '",');
    
    const data = {
        fb_dtsg: fb_dtsg,
        jazoest: jazoest
    };

    const jsonData = JSON.stringify(data, null, 2);

    fs.writeFileSync('fb_dtsg_data.json', jsonData, 'utf8');
    
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
    
    let fb_dtsg;
   //  const fb_dtsg = utils.getFroms(html, '["DTSGInitData",[],{"token":"', '","')[0]; //my brain is not braining on here.
    
    const tokenMatch = html.match(/DTSGInitialData.*?token":"(.*?)"/);
    
    if (tokenMatch) {
    fb_dtsg = tokenMatch[1];
  }
 

    let userID;
    
        //@Kenneth Panio: i fixed the cookie do not change or remove this line what it does? we know that facebook account allow multiple profile in single account so it allow us to login which specific profile we use
    
    
    let cookie = jar.getCookies("https://www.facebook.com");
    let primary_profile = cookie.filter(function (val) {
        return val.cookieString().split("=")[0] === "c_user";
    });
    let secondary_profile = cookie.filter(function (val) {
        return val.cookieString().split("=")[0] === "i_user";
    });
    if (primary_profile.length === 0 && secondary_profile.length === 0) {
        throw {
            error:
            "Error retrieving userID. This can be caused by a lot of things, including getting blocked by Facebook for logging in from an unknown location. Try logging in with a browser to verify.",
        };
    } else {
        if (html.indexOf("/checkpoint/block/?next") > -1) {
            return log.warn(
                "login",
                "Checkpoint detected. Please log in with a browser to verify."
            );
        }
        if (secondary_profile[0] && secondary_profile[0].cookieString().includes('i_user')) {
            userID = secondary_profile[0].cookieString().split("=")[1].toString();
        } else {
            userID = primary_profile[0].cookieString().split("=")[1].toString();
        }
    }
    
    log.info("login", `Logged in as ${userID}`);
    log.info("FCA", " Fix By Kenneth Panio");
    
    try {
        clearInterval(checkVerified);
    } catch (_) { }

    const clientID = (Math.random() * 2147483648 | 0).toString(16);

        const CHECK_MQTT = {
            oldFBMQTTMatch: html.match(/irisSeqID:"(.+?)",appID:219994525426954,endpoint:"(.+?)"/),
            newFBMQTTMatch: html.match(/{"app_id":"219994525426954","endpoint":"(.+?)","iris_seq_id":"(.+?)"}/),
            legacyFBMQTTMatch: html.match(/\["MqttWebConfig",\[\],{"fbid":"(.*?)","appID":219994525426954,"endpoint":"(.*?)","pollingEndpoint":"(.*?)"/)
        }

        // all available regions =))
        /**
         * PRN = Pacific Northwest Region
         * VLL = Valley Region
         * ASH = Ashburn Region
         * DFW = Dallas/Fort Worth Region
         * LLA = Los Angeles Region
         * FRA = Frankfurt
         * SIN = Singapore 
         * NRT = Tokyo (Japan)
         * HKG = Hong Kong
         * SYD = Sydney
         */

        let Slot = Object.keys(CHECK_MQTT);
        var mqttEndpoint,region,irisSeqID;
        Object.keys(CHECK_MQTT).map(function(MQTT) {
            if (CHECK_MQTT[MQTT] && !region) {
                switch (Slot.indexOf(MQTT)) {
                    case 0: {
                        irisSeqID = CHECK_MQTT[MQTT][1];
                            mqttEndpoint = CHECK_MQTT[MQTT][2].replace(/\\\//g, "/");
                            region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
                        return;
                    }
                    case 1: {
                        irisSeqID = CHECK_MQTT[MQTT][2];
                            mqttEndpoint = CHECK_MQTT[MQTT][1].replace(/\\\//g, "/");
                            region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
                        return;
                    }
                    case 2: {
                        mqttEndpoint = CHECK_MQTT[MQTT][2].replace(/\\\//g, "/"); //this really important.
                            region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
                        return;
                    }
                }
            return;
            }
        });   

        const regions = [
            {
                code: "PRN",
                name: "Pacific Northwest Region",
                location: "Khu vực Tây Bắc Thái Bình Dương"
            },
            {
                code: "VLL",
                name: "Valley Region",
                location: "Valley"
            },
            {
                code: "ASH",
                name: "Ashburn Region",
                location: "Ashburn"
            },
            {
                code: "DFW",
                name: "Dallas/Fort Worth Region",
                location: "Dallas/Fort Worth"
            },
            {
                code: "LLA",
                name: "Los Angeles Region",
                location: "Los Angeles"
            },
            {
                code: "FRA",
                name: "Frankfurt",
                location: "Frankfurt"
            },
            {
                code: "SIN",
                name: "Singapore",
                location: "Singapore"
            },
            {
                code: "NRT",
                name: "Tokyo",
                location: "Japan"
            },
            {
                code: "HKG",
                name: "Hong Kong",
                location: "Hong Kong"
            },
            {
                code: "SYD",
                name: "Sydney",
                location: "Sydney"
            },
            {
                code: "PNB",
                name: "Pacific Northwest - Beta",
                location: "Pacific Northwest "
            }
        ];

        if (!region) {
            region = ['prn',"pnb","vll","hkg","sin"][Math.random()*5|0];
            
        }
        if (!mqttEndpoint) {
            mqttEndpoint = "wss://edge-chat.facebook.com/chat?region=" + region;
        }
        log.info('login', `Server region ${region}`);
    
        const Location = regions.find(r => r.code === region.toUpperCase());
    
        const ctx = {
            userID: userID,
            jar: jar,
            clientID: clientID,
            globalOptions: globalOptions,
            loggedIn: true,
            access_token: 'NONE',
            clientMutationId: 0,
            mqttClient: undefined,
            lastSeqId: irisSeqID,
            syncToken: undefined,
            mqttEndpoint: mqttEndpoint,
            region: region,
            firstListen: true,
            req_ID: 0,
            callback_Task: {},
            fb_dtsg
        };

    const api = {
        setOptions: setOptions.bind(null, globalOptions),
        getAppState: function getAppState() {
            return utils.getAppState(jar);
    }
  };
    
    if (region && mqttEndpoint) {
        }
        else {
            if (bypass_region) {
            }
            else {
                api["htmlData"] = html;
            }
        };
    // if (noMqttData) api["htmlData"] = noMqttData;
    
    const defaultFuncs = utils.makeDefaults(html, userID, ctx);

require('fs').readdirSync(__dirname + '/src/')
  .filter((v) => v.endsWith('.js'))
  .map((v) => {
    const functionName = v.replace('.js', ''); 
    api[functionName] = require('./src/' + v)(defaultFuncs, api, ctx);
  });

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

function scheduleRefresh() {
    if (!autoRefreshEnabled) {
        log.info("login", "Automatic refresh is Disabled");
        return;
    }

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

scheduleRefresh();

return {
  ctx: ctx,
  defaultFuncs: defaultFuncs,
  api: api
};
}

// unfortunately login via credentials no longer works,so instead of login via credentials, use login via appstate intead.
function loginHelper(appState, email, password, globalOptions, callback, prCallback) {
    let mainPromise = null;
    const jar = utils.getJar();

    // If appState is provided, set cookies in the jar.
    if (appState) {
        appState.forEach(function (c) {
            const str = `${c.key}=${c.value}; expires=${c.expires}; domain=${c.domain}; path=${c.path};`;
            jar.setCookie(str, `http://${c.domain}`);
        });

        // Load the main page.
        mainPromise = utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true })
            .then(() => utils.saveCookies(jar));
    } else {
        if (email) {
            throw new Error("Login via credentials is no longer supported. Please use login via appState.");
        } else {
            throw new Error("Please provide appState.");
        }
    }

    function checkAndFixError(res, fastSwitch) {
        if (fastSwitch) return res;

        const antiErrorRegex = /7431627028261359627/gs;
        if (antiErrorRegex.test(res.body)) {
            const data = JSON.stringify(res.body);
            const gfidData = data.split('2Fhome.php&amp;gfid=')[1];
            if (!gfidData) return res;

            const fid = gfidData.split("\\\\")[0];
            if (!fid) return res;

            const finalFid = fid.split(`\\`)[0];
            if (!finalFid) return res;

            const redirectLink = redirect[1] + 
                `a/preferences.php?basic_site_devices=m_basic&uri=${encodeURIComponent("https://m.facebook.com/home.php")}&gfid=${finalFid}`;
            bypassRegionError = true;

            return utils.get(redirectLink, jar, null, globalOptions).then(() => utils.saveCookies(jar));
        }

        return res;
    }

    function handleRedirect(res, fastSwitch) {
        if (fastSwitch) return res;

        const redirectRegex = /<meta http-equiv="refresh" content="0;url=([^"]+)[^>]+>/;
        const redirectMatch = redirectRegex.exec(res.body);
        if (redirectMatch && redirectMatch[1]) {
            return utils.get(redirectMatch[1], jar, null, globalOptions);
        }

        return res;
    }

    let redirect = [1, "https://m.facebook.com/"];
    let bypassRegionError = false;
    let ctx, api;

    mainPromise = mainPromise
        .then(res => handleRedirect(res))
        .then(res => checkAndFixError(res))
        .then(res => {
            if (global.OnAutoLoginProcess) return res;

            const regexVia = /MPageLoadClientMetrics/gs;
            if (!regexVia.test(res.body)) {
                return utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true });
            }

            return res;
        })
        .then(res => bypassAutoBehavior(res, jar, globalOptions, appState))
        .then(res => handleRedirect(res, global.OnAutoLoginProcess))
        .then(res => checkAndFixError(res, global.OnAutoLoginProcess))
        .then(res => {
            const html = res.body;
            const obj = buildAPI(globalOptions, html, jar, bypassRegionError);
            ctx = obj.ctx;
            api = obj.api;
            return res;
        });

    if (globalOptions.pageID) {
        mainPromise = mainPromise
            .then(() => utils.get(
                `https://www.facebook.com/${ctx.globalOptions.pageID}/messages/?section=messages&subsection=inbox`,
                ctx.jar, null, globalOptions
            ))
            .then(resData => {
                let url = utils.getFrom(resData.body, 'window.location.replace("https:\\/\\/www.facebook.com\\', '");').split('\\').join('');
                url = url.slice(0, -1);
                return utils.get(`https://www.facebook.com${url}`, ctx.jar, null, globalOptions);
            });
    }

    // Final callback or error handling
    mainPromise
        .then(async res => {
            const detectLocked = await checkIfLocked(res, appState);
            if (detectLocked) throw detectLocked;

            const detectSuspended = await checkIfSuspended(res, appState);
            if (detectSuspended) throw detectSuspended;

            log.info("login", "Done logging in.");
            return callback(null, api);
        })
        .catch(err => callback(err));
}


async function login(loginData, options, callback) {
    if (utils.getType(options) === 'Function' || utils.getType(options) === 'AsyncFunction') {
        callback = options;
        options = {};
    }

    const globalOptions = {
        selfListen: false,
        listenEvents: true,
        listenTyping: false,
        updatePresence: false,
        forceLogin: false,
        autoMarkDelivery: true,
        autoMarkRead: false,
        autoReconnect: true,
        logRecordSize: defaultLogRecordSize,
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

    let prCallback = null;
    if (utils.getType(callback) !== "Function" && utils.getType(callback) !== "AsyncFunction") {
        let rejectFunc = null;
        let resolveFunc = null;
        var returnPromise = new Promise(function(resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });
        prCallback = function(error, api) {
            if (error) return rejectFunc(error);
            return resolveFunc(api);
        };
        callback = prCallback;
    }

async function loginBox() {
    loginHelper(loginData?.appState, loginData?.email, loginData.password, globalOptions, hajime,       (loginError, loginApi) => {
        if (loginError) {
          if (isBehavior) {
            log.warn("login", "Failed after dismiss behavior, will relogin automatically...");
            isBehavior = false;
            loginBox;
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
