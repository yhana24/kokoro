
---

# chatbox-fca-remake - Unofficial Facebook Chat API

This is a fork of the original [fca-unofficial](https://github.com/azlux/facebook-chat-api) repository. This version includes new features and updates that are bundled faster than the main repository. However, be aware that new features may also come with some bugs.

---

## Overview

This API allows you to automate Facebook chat functionalities by emulating the browser's GET/POST requests. It does not work with an auth token and requires a Facebook account's **AppState** (session information), which is obtained via third-party tools.

---

## Important Notes

### **Login via Credentials Is No Longer Supported**

Due to recent changes, the ability to log in using **credentials** (i.e., email and password) directly through the API has been disabled. As a result, you cannot use the old login method with your email and password anymore.

### **api.getAppState finally works!**

To use the API, you need to provide an **AppState** (session information) from a previously authenticated session. You can use **`api.getAppState()`** to retrieve and even update your **AppState** after login.

- **Kiwi Browser & c3c-ufc-utility Extension**: Extract the **AppState** using the **Kiwi Browser** along with the **c3c-ufc-utility extension** to obtain session cookies after logging into Facebook manually.

Once you have the **AppState**, you can load it into the API to authenticate. Additionally, **`api.getAppState()`** can now be used to **update the AppState** during the session.

We strongly recommend being responsible when using this API to avoid issues like account bans. Avoid spamming messages, sending large amounts of requests, or using excessive automation.

---

## New Features

### 1. **BypassAutomationBehavior**

This feature is designed to bypass certain behavior detection mechanisms from Facebook, which may otherwise flag your actions as automated. By enabling this, your bot's activity will appear more like human interaction, helping reduce the risk of account limitations.

- **Configuration**: Can be toggled on or off in the `NextGen-FCA.json` configuration file.

### 2. **AutoRefreshFbDtsg**

This feature automatically refreshes the **fb_dtsg** token, which is used for secure communication with Facebook. Since **fb_dtsg** tokens expire periodically, this feature ensures your session stays active by refreshing the token automatically without requiring a manual login.

- **Configuration**: Can be toggled on or off in the `NextGen-FCA.json` configuration file.

---

## How to Get AppState

1. **Kiwi Browser & c3c-ufc-utility Extension**
   - Install **Kiwi Browser** and the **c3c-ufc-utility extension**.
   - Use the extension to extract your **AppState** (session cookies) from your Facebook login.
   - Save the **AppState** as a `appstate.json` file and load it for logging in.

For more details, check the official [c3c-ufc-utility GitHub release](https://github.com/c3cbot/c3c-ufc-utility/releases).

---

## Install

To install **chatbox-fca-remake**, use the following npm command:

```bash
npm install chatbox-fca-remake
```

To install the bleeding-edge version directly from GitHub:

```bash
npm install chatbox-fca-remake
```

---

## Example Usage

Here’s how to log in using **AppState**:

```javascript
const fs = require('fs');
const login = require('chatbox-fca-remake');

// Load your appState from the saved file
const appState = JSON.parse(fs.readFileSync('appstate.json', 'utf8'));

// Use the appState for login
login({ appState: appState }, (err, api) => {
    if (err) return console.error('Login failed:', err);

    console.log('Successfully logged in!');

    // Example of listening for new messages
    api.listen((err, message) => {
        if (err) return console.error(err);

        // Respond to the received message
        api.sendMessage(message.body, message.threadID);
    });

    // Get and update AppState if needed
    const updatedAppState = api.getAppState();
    fs.writeFileSync('appstate.json', JSON.stringify(updatedAppState));
});
```

### Configuration (`NextGen-FCA.json`)

The following options can be configured in your `NextGen-FCA.json` file:

```json
{
  "BypassAutomationBehavior": true,  // Set to false to disable this feature
  "AutoRefreshFbDtsg": true         // Set to false to disable this feature
}
```

- **BypassAutomationBehavior**: Enables or disables the feature to bypass Facebook's automated behavior detection.
- **AutoRefreshFbDtsg**: Enables or disables automatic refreshing of the **fb_dtsg** token to keep your session active.

---

## Main Functionality

- **Sending Messages:**
    - Regular Text Messages
    - Sticker Messages
    - Image/File Attachments
    - URLs
    - Emojis

- **Listening to Messages:**
    - Listen to messages in real-time
    - Option to listen to events like user joining or leaving a chat

---

## FAQ

1. **How can I log in without credentials?**
   - After logging in through a browser, extract your **AppState** using the **c3c-ufc-utility extension**. This is now the only way to authenticate.

2. **Can I listen to messages from the bot?**
   - Yes, by default, the bot listens to incoming messages and can respond automatically. You can configure it to respond with specific actions based on the message content.

3. **Is there a way to send media like images or files?**
   - Yes, you can send files or images by passing them as attachments. The example provided demonstrates how to send an image along with a text message.

4. **How do I keep my session alive?**
   - You do not need to log in repeatedly once you have your **AppState** saved. Simply load the **appState.json** each time you initialize the API.

5. **Can I send messages as a Facebook Page?**
   - Yes, you can configure the login to use a Facebook Page ID for sending messages as a Page. This is done during the login step.

---

## Projects Using This API

- [c3c](https://github.com/lequanglam/c3c) - A customizable bot with Facebook and Discord support.
- [Messenger-CLI](https://github.com/AstroCB/Messenger-CLI) - Command-line interface for Facebook Messenger.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact & Community

If you have a problem with this FCA, you can contact us by clicking here:

- [JR Busaco](https://www.facebook.com/jr.busaco.271915)
- [Haji Atomyc](https://www.facebook.com/haji.atomyc2727)

Join our group **ChatBot Community**:

- [ChatBot Community](https://www.facebook.com/groups/coders.dev)

---

**Note:** This project is an unofficial Facebook chat API. Use it responsibly and follow Facebook’s terms of service.

---

