
/* Constants */
const VERSION = '1.0.0';
const CHANCE = new (require('chance'))();

const ModelTypes = {
  HEADSHOP: 'Headshop',
  ARTIST: 'Artist',
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
  phone: `${ CHANCE.integer({ min: 100, max: 999 }) }-${ CHANCE.integer({ min: 100, max: 999 }) }-${ CHANCE.integer({ min: 1000, max: 9999 }) }`,
  email: CHANCE.email(),
  tagline: CHANCE.sentence({ words: 4 }),
  description: CHANCE.paragraph({ sentences: 5 }),
  memberSince: CHANCE.date({ string: true }),
  rating: CHANCE.floating({ min: 0, max: 5, fixed: 2 }),
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
 * Headshop HAS-MANY Pieces
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
 * Artist HAS-MANY Pieces
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
    price: CHANCE.dollar(),
    tagline: CHANCE.sentence({ words: 5 }),
    rating: CHANCE.floating({ min: 0, max: 5, fixed: 2 }),
    image: 'https://placehold.it/400x400',
    images: [],
}), config);

/* Database */
class Database extends ConfigurationProvider {
  constructor(config) {
    super(config);

    this.headshopsById      = new Map();
    this.artistsById        = new Map();
    this.piecesById         = new Map();
    this.piecesByHeadshopId = new Map();
    this.piecesByArtistId   = new Map();

    this
      .initializeHeadshops()
      .initalizeArtists()
      .initializePieces();
  }

  initializeModels(map, generateModel, min = 20, max = 100) {
    let count = CHANCE.integer({ min, max });
    let id = 0;

    while (count) {
      const nextId = ++id;
      const images = [];

      let imageCount = CHANCE.integer({ min: 1, max: 40 });

      while (imageCount) {
        images.push('http://placehold.it/400x400');
        imageCount--;
      }

      map.set(nextId, generateModel({
        id: nextId,
        images
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

  initializePieces() {
    let count = CHANCE.integer({ min: 100, max: 1000 });
    let id = 0;

    while (count) {
      const nextId = ++id;
      const seed = CHANCE.pickone(['headshop', 'artist', 'headshop and artist']);
      const piece = generatePiece({
        id: nextId
      });
      const images = [];

      let imageCount = CHANCE.integer({ min: 1, max: 40 });

      while (imageCount) {
        images.push('http://placehold.it/400x400');
        imageCount--;
      }
      
      piece.images = images;

      const { size: headshopsSize } = this.headshopsById;
      const headshopId = CHANCE.integer({ min: 1, max: headshopsSize });
      const piecesByHeadshopId = this.piecesByHeadshopId.get(headshopId) || [];
      
      const { size: artistsSize } = this.artistsById;
      const artistId = CHANCE.integer({ min: 1, max: artistsSize });
      const piecesByArtistId = this.piecesByArtistId.get(artistId) || [];        
      
      const relevantHeadshop = this.headshopsById.get(headshopId);   

      if (seed === 'headshop') {

        piece.headshopId = headshopId;
        piece.owner = relevantHeadshop.name;
        piece.address = relevantHeadshop.address;       
        piece.phone = relevantHeadshop.phone;
        piece.email = relevantHeadshop.email;

        this.piecesById.set(nextId, piece);
        this.piecesByHeadshopId.set(headshopId, [...piecesByHeadshopId, piece]);

        count--;

        continue;
      }

      if (seed === 'artist') {
        const relevantArtist = this.artistsById.get(artistId);

        piece.artistId = artistId;
        piece.owner = relevantArtist.name;
        piece.address = relevantArtist.address;
        piece.phone = relevantArtist.phone;
        piece.email = relevantArtist.email;

        this.piecesById.set(nextId, piece);
        this.piecesByArtistId.set(artistId, [...piecesByArtistId, piece]);

        count--;

        continue;
      }

            
      piece.headshopId = headshopId;
      piece.artistId = artistId;
      piece.owner = relevantHeadshop.name;
      piece.address = relevantHeadshop.address;       
      piece.phone = relevantHeadshop.phone;
      piece.email = relevantHeadshop.email;

      this.piecesById.set(nextId, piece);
      this.piecesByHeadshopId.set(headshopId, [...piecesByHeadshopId, piece]);
      this.piecesByArtistId.set(artistId, [...piecesByArtistId, piece]);

      count--;
    }
  }
}

const _DATABASE = new Database({
  version: VERSION,
});

/* API */
class API {
  constructor(database) {
    this.database = database;
  }

  getHeadshop(id) {
    return JSON.stringify(this.database.headshopsById.get(+id));
  }

  getHeadshops() {
    return JSON.stringify([...this.database.headshopsById]);
  }

  getArtist(id) {
    return JSON.stringify(this.database.artistsById.get(+id));
  }

  getArtists() {
    return JSON.stringify([...this.database.artistsById]);
  }

  getPiece(id) {
    return JSON.stringify(this.database.piecesById.get(+id));
  }

  getPieces() {
    return JSON.stringify([...this.database.piecesById]);
  }

  getPiecesByHeadshop(id) {        
    return JSON.stringify(this.database.piecesByHeadshopId.get(+id));
  }

  getPiecesByArtist(id) {
    return JSON.stringify(this.database.piecesByArtistId.get(+id));
  }
}

const _API = new API(_DATABASE);

/* Server */
const express = require('express');
const app = express();
const port = process.env.PORT || 6166;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => res.send(`Glassfinder API v. ${VERSION}`));

app.get('/headshops', (req, res) => {
  res.send(_API.getHeadshops());
});

app.get('/headshops/:id', ({ params: { id } }, res) => {
  res.send(_API.getHeadshop(id));
});

app.get('/artists', (req, res) => {
  res.send(_API.getArtists());
});

app.get('/artists/:id', ({ params: { id } }, res) => {
  res.send(_API.getArtist(id));
});

app.get('/pieces', (req, res) => {
  res.send(_API.getPieces());
});

app.get('/pieces/:id', ({ params: { id } }, res) => {
  res.send(_API.getPiece(id));
});

app.get('/pieces/headshop/:id', ({ params: { id } }, res) => {
  res.send(_API.getPiecesByHeadshop(id));
});

app.get('/pieces/artist/:id', ({ params: { id } }, res) => {
  res.send(_API.getPiecesByArtist(id));
});

app.listen(port, () => console.info(`Glassfinder API listening on port ${port}`));