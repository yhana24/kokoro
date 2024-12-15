const axios = require('axios');

module.exports["config"] = {
  name: "nikke",
  credits: 'atomic-zero',
  version: "1.0.0",
  info: "Fetches information about a Nikke character from the provided API and returns an image and information about the character.",
  type: 'information-fetch',
  usage: "[character_name]",
  guide: "Nikke Scarlet\n\nResults: Nikke Code: <Unity File Code>\nName: Scarlet\nDescription: A wandering swordswoman from Pioneer who's partial to a good drink. Despite the common perception of melee weapons being ineffective in combat, she chooses to wield a sword.\nElement: Electric\nWeapon: Assault Rifle\nClass: Attacker\nBurst: 3\nRarity: SSR\nManufacturer: Pilgrim\nSquad: Pioneer",
  aliases: ["nikkeinfo", "nikkechar"],
  role: 0,
  cd: 20
};

module.exports["run"] = async function({ chat, args, font, global }) {
  try {
    const characterName = args.join(' ');

    if (!characterName) {
      chat.react("😔");
      chat.reply(font.italic("Please provide a character name."));
      return;
    }

    const infoResponse = await axios.get(global.api["nikke"][0] + `/${encodeURI(characterName)}`);

    if (infoResponse.status !== 200 || !infoResponse.data.name) {
      chat.react("😔");
      chat.reply(font.italic(`No character found for the provided name: ${characterName}.`));
      return;
    }

    const {
      imgBig,
      img,
      name,
      description,
      element,
      weapon,
      class: characterClass,
      burst,
      rarity,
      manufacturer,
      squad,
      cv_en,
      cv_kr,
      cv_jp,
      skins,
      statTableId,
      burstGen,
      maxAmmo,
      damage,
      chargeTime,
      chargeDamage,
      reloadTime,
      skills,
      skillprio,
      tierlist,
      recommendations,
      overloadrecs
    } = infoResponse.data;

    const skillsInfo = skills.map(skill => {
      const id = skill.id;
      const skillname = skill.name;
      let description = skill.description.replace(/<[^>]+>/g, '');
      Object.keys(skill.levels[0]).forEach(key => {
        description = description.replace(`{${key}}`, skill.levels[0][key]);
      });
      const cooldown = skill.cooldown;
      const levels = skill.levels;
      return { id, skillname, description, cooldown, levels };
    });

    const infoMessage = `Name: ${name}
Description: ${description}
Element: ${element}
Weapon: ${weapon}
Class: ${characterClass}
Burst: ${burst}
Rarity: ${rarity}
Manufacturer: ${manufacturer}
Squad: ${squad}
CV (English): ${cv_en}
CV (Korean): ${cv_kr}
CV (Japanese): ${cv_jp}
Burst Generation: ${burstGen}
Max Ammo: ${maxAmmo}
Damage: ${damage}
Charge Time: ${chargeTime}
Charge Damage: ${chargeDamage}
Reload Time: ${reloadTime}

Skills:
${skillsInfo.map(skill => `- ${skill.skillname}: ${skill.description} ${'(Cooldown:' + skill.cooldown || 'Passive' })`).join('\n')}

Tier List: ${tierlist.Combined}
Recommended Cube: ${recommendations.main}
Alternative Cube: ${recommendations.alternative}
Overload Recommendations:
- Element Damage Dealt: ${overloadrecs["Element Damage Dealt"]}
- Hit Rate: ${overloadrecs["Hit Rate"]}
- Max Ammunition Capacity: ${overloadrecs["Max Ammunition Capacity"]}
- ATK: ${overloadrecs["ATK"]}
- Charge Damage: ${overloadrecs["Charge Damage"]}
- Critical Rate: ${overloadrecs["Critical Rate"]}
- Critical Damage: ${overloadrecs["Critical Damage"]}

Skill Priorities:
- PvP: ${tierlist.SkillPrioPvp}
- Budget Skill investments: ${skillprio["Budget Skill investments"]}
- Recommended Skill Investments: ${skillprio["Recommended Skill Investments"]}
- Skill Order Priority: ${skillprio["Skill Order Priority"]}
- Priority: ${skillprio.Priority}
- Notes: ${skillprio.Notes}`;

    chat.react("🥵");
    chat.reply(font.italic(infoMessage));

    const urlstatic = 'https://static.dotgg.gg/nikke/characters/';

    const fullImageUrl = urlstatic + imgBig + '.png';
    const smallImageUrl = urlstatic + img + '.png';

    const images = [];
    const imageUrls = [fullImageUrl, smallImageUrl];
    for (const url of imageUrls) {
      const response = await axios.get(url, { responseType: "stream" });
      images.push(response.data);
    }
    if (images.length > 0) {
      chat.log('Successfully Fetch Image from Nikke!');
      chat.reply({ attachment: images });
    }
    

  } catch (error) {
    chat.react("⚠️");
    chat.error('Error fetching character information:' + error.message);
    chat.reply(error.message);
  }
};
