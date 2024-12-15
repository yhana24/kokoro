const axios = require("axios");

module.exports = {
  config: {
    name: "stalk",
    aliases: ["dox"],
    credits: "Kenneth Panio",
    info: "Stalk someone's Facebook profile and get information about them.",
    role: 0,
    version: "1.0.0",
    usage: "[optional: mention/uid/link]",
    cd: 60,
  },

  run: async ({ event, chat, args, font, global }) => {
    const mono = txt => font.monospace(txt);
    const token = await chat.token();
    let targetID;
    var delay = 120000;
    const targetInput = args[0];

    const facebookLinkRegex = /(?:https?:\/\/)?(?:www\.)?facebook\.com\/(?:profile\.php\?id=)?(\d+)|@(\d+)|facebook\.com\/([a-zA-Z0-9.]+)/i;
    const isFacebookLink = facebookLinkRegex.test(targetInput);

    if (isFacebookLink) {
        const uid = await chat.uid(targetInput);
        if (!uid) {
          chat.reply(mono("User does not exist or was not found."));
          return;
        }
        targetID = uid;
      } else if (Object.keys(event.mentions).length > 0) {
         targetID = Object.keys(event.mentions)[0];
      } else if (targetInput) {
        targetID = targetInput;
      } else {
        targetID = event.senderID;
      }
    

    try {
      const profileResponse = await axios.get(`https://graph.facebook.com/${targetID}?fields=id,is_verified,cover,created_time,work,hometown,username,link,name,locale,location,about,website,birthday,gender,relationship_status,significant_other,quotes,first_name,subscribers.limit(0)&access_token=${token}`);
      const profileData = profileResponse.data;

      if (!profileData || !profileData.id || !profileData.name) {
        chat.reply(mono("User does not exist or was not found."));
        return;
      }

      const { id, is_verified, cover, created_time, work, hometown, username, link, name, locale, location, about, website, birthday, gender, relationship_status, significant_other, quotes, first_name, subscribers } = profileData;

      let message = `Name: ${name}\nID: ${id}\nVerified: ${is_verified}\nCreated Time: ${created_time}\nLocale: ${locale}\nFirst Name: ${first_name}\n`;
      
      if (birthday) {
        message += `Birthday: ${birthday}\n`;
      }

      if (hometown && hometown.name) {
        message += `Hometown: ${hometown.name}\n`;
      }

      if (username) {
        message += `Username: ${username}\n`;
      }
    
      if (about) {
        message += `About: ${about}\n`;
      }
      
      if (website) {
        message += `Website: ${website ? website : 'N/A'}\n`;
      }

      if (gender) {
        message += `Gender: ${gender}\n`;
      }

      if (relationship_status) {
        message += `Relationship Status: ${relationship_status}\n`;
      }

      if (quotes) {
        message += `Quotes:\n${quotes}\n`;
      }

      message += `Followers: ${subscribers ? subscribers.summary.total_count : 0}`;

      const info = await chat.reply(mono(message));
      info.unsend(delay);

      const attachments = [];

      if (cover && cover.source) {
        const coverResponse = await axios.get(cover.source, { responseType: 'stream' });
        attachments.push(coverResponse.data);
      }

      const avatarURL = `https://graph.facebook.com/${targetID}/picture?width=1500&height=1500&access_token=${token}`;
      const avatarResponse = await axios.get(avatarURL, { responseType: 'stream' });
      attachments.push(avatarResponse.data);

      if (attachments.length > 0) {
       const profile = await chat.reply({ body: mono("Profile"), attachment: attachments });
       profile.unsend(delay);
      }

      const getPostImages = async () => {
        try {
          const photosResponse = await axios.get(`https://graph.facebook.com/v13.0/${targetID}/photos?type=uploaded&fields=id&access_token=${token}`);
          const photoIDs = photosResponse.data.data;
          
          if (!photoIDs || photoIDs.length === 0) {
            return [];
          }
          
          const photoPromises = photoIDs.map(photo => {
            const photoID = photo.id;
            return axios.get(`https://graph.facebook.com/v13.0/${photoID}/?fields=images&access_token=${token}`);
          });

          const photosData = await Promise.all(photoPromises);
          
          const imagePromises = photosData.map(photoResponse => {
            const images = photoResponse.data.images;
            if (images && images.length > 0) {
              const imageUrl = images[0].source;
              return axios.get(imageUrl, { responseType: 'stream' });
            }
          });

          return await Promise.all(imagePromises);
        } catch (error) {
          console.error("Error fetching post images:", error.message);
          return [];
        }
      };

      const postImages = await getPostImages();
      const imageAttachments = postImages.filter(imageResponse => imageResponse).map(imageResponse => imageResponse.data);

      if (imageAttachments.length > 0) {
        const posts =await chat.reply({ body: mono("Post Images"), attachment: imageAttachments });
        posts.unsend(delay)
      }

    } catch (error) {
      if (error.response && (error.response.status === 404 || error.response.status === 400)) {
        chat.reply(mono("User does not exist or was not found."));
      } else {
        chat.reply(mono("An error occurred while fetching the user's information: " + error.message));
      }
    }
  }
};
