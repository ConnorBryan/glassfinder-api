
/* Constants */
const VERSION = '1.0.0';
const CHANCE = new (require('chance'))();
CHANCE.phone = () => (
  `${ CHANCE.integer({ min: 100, max: 999 }) }-${ CHANCE.integer({ min: 100, max: 999 }) }-${ CHANCE.integer({ min: 1000, max: 9999 }) }`
);
const ModelTypes = {
  HEADSHOP: 0,
  ARTIST: 1,
};

/* Abstracts */
class ConfigurationProvider {
  constructor(config) {
    Object.assign(this, config);
  }
}

/* Models */
/**
 * @abstract Model
 * Base-level component for common fields.
 */
class Model extends ConfigurationProvider {
  constructor(config) {
    super(config);
  }
}

const generateModelConfig = config => Object.assign({
  id: 0,
  name: CHANCE.name(),
  image: 'https://placehold.it/400x400',
  phone: CHANCE.phone(),
  email: CHANCE.email(),
  address: {
    street: CHANCE.address(),
    city: CHANCE.city(),
    state: CHANCE.state(),
    zip: CHANCE.zip(),
  },
  position: {
    lat: CHANCE.latitude(),
    lng: CHANCE.longitude(),
  }
}, config);

/**
 * @class Headshop
 */
class Headshop extends Model {
  constructor(config) {
    super(config);
    this.type = ModelTypes.HEADSHOP;
  }
}

const generateHeadshop = config => {
  const modelConfig = generateModelConfig(config);
  
  modelConfig.name = CHANCE.capitalize(CHANCE.word());

  return new Headshop(modelConfig);
};

/**
 * @class Artist
 */
class Artist extends Model {
  constructor(config) {
    super(config);
    this.type = ModelTypes.ARTIST;
  }
}

const generateArtist = config => {
  const modelConfig = generateModelConfig(config);

  return new Artist(modelConfig);
};

const h = generateHeadshop();
const a = generateArtist();

console.log(h, a);

/**
 * @class Piece
 * Piece BELONGS-TO Headshop
 * Piece BELONGS-TO Artist
 */
class Piece {
  constructor(config) {
    Object.assign(this, config);
  }
}

const generatePiece = config => Object.assign(new Piece({
    id: 0,
    headshopId: 0,
    artistId: 0,
    name: CHANCE.capitalize(CHANCE.word()),
    description: CHANCE.paragraph({ sentences: 5 }),
    price: `$${ CHANCE.floating({ min: 10, max: 300, fixed: 2 }) }`,
    image: 'https://placehold.it/400x400',
    images: [],
}), config);

/* Database */
class Database extends ConfigurationProvider {
  constructor(config) {
    super(config);

    this.headshopsById = new Map();
    this.artistsById = new Map();
    this.piecesById = new Map();
    this.piecesByHeadshopId = new Map();
    this.piecesByArtistId = new Map();

    this
      .initializeHeadshops()
      .initalizeArtists();
  }

  initializeModels(map, generateModel, min = 20, max = 100) {
    let count = CHANCE.integer({ min, max });
    let id = 0;

    while (count) {
      const nextId = ++id;
      map.set(nextId, generateModel({
        id: nextId,
      }));
      count--;
    }

    return this;
  }
  
  initializeHeadshops() {
    return this.initializeModels(this.headshopsById, generateHeadshop);
  }

  initalizeArtists() {
    return this.initializeModels(this.artistsById, generateArtist);
  }
}

const _DATABASE = new Database({
  version: VERSION,
});
console.info(`Database initialized`, _DATABASE);

/* API */
class API extends ConfigurationProvider {
  constructor(config) {
    super(config);
  }
}

const _API = new API({
  version: VERSION,
});
console.info(`API initialized`, _API);

/* Server */
const express = require('express');
const app = express();
const port = process.env.PORT || 6166;

app.get('/', (req, res) => res.send(`Glassfinder API v. ${VERSION}`));

app.listen(port, () => console.info(`Glassfinder API listening on port ${port}`));