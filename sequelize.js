const Sequelize = require('sequelize');
const CHANCE = new (require('chance'))();

/*
  D a t a b a s e
    C o n f i g u r a t i o n
*/
const SEQUELIZE = new Sequelize(
  'glassfinder',
  'glassfinder',
  '1Qazmlp01!',
  {
    host: '104.236.12.41',
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
    },
  },
);

/*
  M o d e l
    D e f i n i t i o n s
*/
const defaultAttributes = {
  name: Sequelize.STRING,
  image: Sequelize.STRING,
  phone: Sequelize.STRING,
  email: Sequelize.STRING,
  tagline: Sequelize.TEXT,
  description: Sequelize.TEXT,
  memberSince: Sequelize.DATE,
  rating: Sequelize.FLOAT,
  street: Sequelize.STRING,
  city: Sequelize.STRING,
  state: Sequelize.STRING,
  zip: Sequelize.STRING,
  lat: Sequelize.STRING,
  lng: Sequelize.STRING,
};

const User = SEQUELIZE.define(
  'user',
  Object.assign({}, defaultAttributes),
  {
    name: {
      singular: 'user',
      plural: 'users',  
    }
  }
);

const Headshop = SEQUELIZE.define(
  'headshop',
  Object.assign({}, defaultAttributes),
  {
    name: {
      singular: 'headshop',
      plural: 'headshops',
    }
  }
);

const Artist = SEQUELIZE.define(
  'artist',
  Object.assign({}, defaultAttributes),
  {
    name: {
      singular: 'artist',
      plural: 'artists',
    },
  }
);

const Company = SEQUELIZE.define(
  'company',
  Object.assign({}, defaultAttributes),
  {
    name: {
      singular: 'company',
      plural: 'companies',  
    },
  }
);

const Piece = SEQUELIZE.define('piece', {
  title: Sequelize.STRING,
  image: Sequelize.STRING,
  description: Sequelize.TEXT,
  price: Sequelize.DOUBLE,
});

/*
  A s s o c i a t i o n s
*/
Headshop.belongsToMany(Artist, {
  through: 'HeadshopArtist',
  foreignKey: 'Headshop_uid',
});
Artist.belongsToMany(Headshop, {
  through: 'HeadshopArtist',
  foreignKey: 'Artist_uid',
});

Headshop.belongsToMany(Company, {
  through: 'HeadshopCompany',
  foreignKey: 'Headshop_uid',
});
Company.belongsToMany(Headshop, {
  through: 'HeadshopCompany',
  foreignKey: 'Company_uid',
});

Artist.belongsToMany(Company, {
  through: 'ArtistCompany',
  foreignKey: 'Artist_uid',
});
Company.belongsToMany(Artist, {
  through: 'ArtistCompany',
  foreignKey: 'Company_uid',
});

Piece.belongsTo(Headshop);
Piece.belongsTo(Artist);
Piece.belongsTo(Company);

/*
  P o p u l a t i o n
*/
const generateDefaultAttributes = () => ({
  name: CHANCE.name(),
  image: 'https://placehold.it/400x400',
  phone: `${ CHANCE.integer({ min: 100, max: 999 }) }-${ CHANCE.integer({ min: 100, max: 999 }) }-${ CHANCE.integer({ min: 1000, max: 9999 }) }`,
  email: CHANCE.email(),
  tagline: CHANCE.sentence({ words: 4 }),
  description: CHANCE.paragraph({ sentences: 5 }),
  memberSince: CHANCE.date(),
  rating: CHANCE.floating({ min: 0, max: 5, fixed: 2 }),
  street: CHANCE.address(),
  city: CHANCE.city(),
  state: CHANCE.state(),
  zip: CHANCE.zip(),
  lat: CHANCE.latitude(),
  lng: CHANCE.longitude(),
});

/*
  S y n c h r o n i z a t i o n
*/
// (async () => {
//   await SEQUELIZE.sync({ force: true });

//   Headshop.create(generateDefaultAttributes());
//   Artist.create(generateDefaultAttributes());
//   Company.create(generateDefaultAttributes());
// })();

module.exports = {
  SEQUELIZE,
  defaultAttributes,
  generateDefaultAttributes,
  User,
  Headshop,
  Artist,
  Company,
  Piece,
};