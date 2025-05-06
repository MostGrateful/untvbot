const axios = require('axios');
require('dotenv').config();

const TRELLO_BASE = 'https://api.trello.com/1';
const BOARD_ID = 'klNFx3G4'; // Replace if you ever change the board

const auth = {
  key: process.env.TRELLO_API_KEY,
  token: process.env.TRELLO_API_TOKEN,
};

async function getLists() {
  const { data } = await axios.get(`${TRELLO_BASE}/boards/${BOARD_ID}/lists`, { params: auth });
  return data.reduce((map, list) => {
    map[list.name.toLowerCase()] = list.id;
    return map;
  }, {});
}

async function getLabels() {
  const { data } = await axios.get(`${TRELLO_BASE}/boards/${BOARD_ID}/labels`, { params: auth });
  return data.reduce((map, label) => {
    map[label.name.toLowerCase()] = label.id;
    return map;
  }, {});
}

async function createCard(listId, name, desc, labelId = null) {
  const params = {
    ...auth,
    idList: listId,
    name,
    desc,
  };

  if (labelId) params.idLabels = labelId;

  await axios.post(`${TRELLO_BASE}/cards`, null, { params });
}

async function deleteCardByName(name) {
  const { data: lists } = await axios.get(`${TRELLO_BASE}/boards/${BOARD_ID}/lists`, { params: auth });

  for (const list of lists) {
    const { data: cards } = await axios.get(`${TRELLO_BASE}/lists/${list.id}/cards`, { params: auth });
    const card = cards.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (card) {
      await axios.delete(`${TRELLO_BASE}/cards/${card.id}`, { params: auth });
      return true;
    }
  }

  return false;
}

module.exports = {
  getLists,
  getLabels,
  createCard,
  deleteCardByName,
};
