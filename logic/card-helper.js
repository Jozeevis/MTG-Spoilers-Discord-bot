const _ = require("lodash");

module.exports = {
  generateDescriptionText: generateDescriptionText,
};

// Generate the description of a card
// Adapted version from github.com/NoxxFlame/MTG-Spoilers-Discord-bot
function generateDescriptionText(card) {
  const ptToString = (card) =>
    "**" +
    card.power.replace(/\*/g, "\\*") +
    "/" +
    card.toughness.replace(/\*/g, "\\*") +
    "**";

  const description = [];
  if (card.type_line) {
    // bold type line
    let type = `${card.printed_type_line || card.type_line}`;
    type += ` (${_.capitalize(card.rarity)})`;
    description.push(type);
  }

  if (card.oracle_text) {
    // reminder text in italics
    const text = card.printed_text || card.oracle_text;
    description.push(text.replace(/[()]/g, (m) => (m === "(" ? "_(" : ")_")));
  }

  if (card.flavor_text) {
    // flavor text in italics
    description.push("_" + card.flavor_text + "_");
  }

  if (card.loyalty) {
    // bold loyalty
    description.push("**Loyalty: " + card.loyalty + "**");
  }

  if (card.power) {
    // bold P/T
    description.push(ptToString(card));
  }

  if (card.card_faces) {
    // split cards are special
    card.card_faces.forEach((face) => {
      description.push("**" + face.type_line + "**");
      if (face.oracle_text) {
        description.push(
          face.oracle_text.replace(/[()]/g, (m) => (m === "(" ? "_(" : ")_"))
        );
      }
      if (face.power) {
        description.push(ptToString(face));
      }
      description.push("");
    });
  }

  return description.join("\n");
}
