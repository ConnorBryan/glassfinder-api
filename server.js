/**
 * @overview
 * A model is a single named type that
 *  a) Exists in the database.
 *  b) Shared relationships with other models.
 *  c) Provides a set of common routes to retrieve data from the database.
 * 
 *  Routes for each model:
 *    1) /<plural>?[filter=id, page=0]
 *      Returns: A collection of models, sorted by ID.
 *               If a filter is provided, the collection is sorted by said filter.
 *               If a page is provided, that subsection is given.
 *    2) /<singular>/:id
 *      Returns: A single model at the given ID.
 */
const CHANCE = new (require('chance'))();
const MODELS = require('./models');

const DEFAULT_PAGINATION_CONFIG = {
  perPage: 5,
};

class API {
  constructor(paginationConfig = DEFAULT_PAGINATION_CONFIG) {
    this.paginationConfig = paginationConfig;
    this.generateApp = require('./app').bind(this);
    this.initializeModels();
  }

  /* Randomization */
  generateModelConfig() {
    return {
      id: 0,
      name: CHANCE.name(),
      image: 'https://placehold.it/400x400',
      images: [],
      phone: `${ CHANCE.integer({ min: 100, max: 999 }) }-${ CHANCE.integer({ min: 100, max: 999 }) }-${ CHANCE.integer({ min: 1000, max: 9999 }) }`,
      email: CHANCE.email(),
      tagline: CHANCE.sentence({ words: 4 }),
      description: CHANCE.paragraph({ sentences: 5 }),
      memberSince: CHANCE.date({ string: true }),
      price: CHANCE.dollar(),
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
    }
  }

  getModelCount(multiplier = 1) {
    return CHANCE.integer({ min: 30, max: 600 }) * multiplier;
  }

  getImageCount() {
    return CHANCE.integer({ min: 3, max: 20 });
  }

  getAssociationCount() {
    return CHANCE.integer({ min: 2, max: 10 });
  }

  /* Initialization */
  /**
   * @method initializeModel
   * @desc Create a randomized collection and initialize associations for all models.
   */
  initializeModels() {
    MODELS.forEach(model => this.initializeModelCollection(model.plural, model.class));
    this.initializeAssociations();
  }

  /**
   * @method initializeModelCollection
   * @desc Given a model type and its relevant class,
   *       return a collection of generated models matching said type.
   * @param {string} type
   * @param {class} ModelClass
   * @returns {Array<Model>}
   */
  initializeModelCollection(type, ModelClass) {
    const collection = [];

    let count = 0;
    let max = this.getModelCount();

    if (type === 'pieces') max *= 50;

    while (count < max) {
      count++;

      const model = this.generateModelConfig();      

      model.id = count + '';

      let imageCount = this.getImageCount();

      while (imageCount) {
        imageCount--;

        model.images.push('http://placehold.it/400x400');
      }

      collection.push(new ModelClass(model));
    }

    this[type] = collection;
  }

  /**
   * TODO: Do this alogirthmically.
   * @method initializeAssociations
   * @desc For each model in each model type collection, associate said
   *       model with other models as specified.
   */
  initializeAssociations() {
    this.initializeHeadshopAssociations();
    this.initializeArtistAssociations();
    this.initializePieceAssociations();
  }

  initializeHeadshopAssociations() {
    this.headshops.forEach(headshop => {
      let artistCount = this.getAssociationCount();
      let companyCount = this.getAssociationCount();

      while (artistCount) {
        const index = CHANCE.integer({ min: 0, max: this.artists.length - 1 });
        const artist = this.artists[index];

        if (headshop.artists.includes(artist.id)) continue;

        headshop.artists.push(artist.id);
        artist.headshops.push(headshop.id);

        artistCount--;
      }

      while (companyCount) {
        const index = CHANCE.integer({ min: 0, max: this.companies.length - 1 });
        const company = this.companies[index];

        if (headshop.companies.includes(company.id)) continue;

        headshop.companies.push(company.id);
        company.headshops.push(headshop.id);

        companyCount--;
      }
    });
  }

  initializeArtistAssociations() {
    this.artists.forEach(artist => {
      let companyCount = this.getAssociationCount();

      while (companyCount) {
        const index = CHANCE.integer({ min: 0, max: this.companies.length - 1 });
        const company = this.companies[index];

        if (artist.companies.includes(company.id)) continue;

        artist.companies.push(company.id);
        company.artists.push(artist.id);

        companyCount--;
      }
    });
  }

  initializePieceAssociations() {
    this.pieces.forEach(piece => {
      const seed = CHANCE.integer({ min: 0, max: 2 });

      if (seed === 0) {
        const index = CHANCE.integer({ min: 0, max: this.headshops.length - 1 });
        const headshop = this.headshops[index];

        piece.headshops.push(headshop.id);
        headshop.pieces.push(piece.id);

        return;
      }

      if (seed === 1) {
        const index = CHANCE.integer({ min: 0, max: this.artists.length - 1 });
        const artist = this.artists[index];

        piece.artists.push(artist.id);
        artist.pieces.push(piece.id);

        return;
      }

      if (seed === 2) {
        const index = CHANCE.integer({ min: 0, max: this.companies.length - 1 });
        const company = this.companies[index];

        piece.companies.push(company.id);
        company.pieces.push(piece.id);

        return;
      }
    });
  }

  /* Pagination */
  /**
   * @desc Given a model type, split the collection
   *       into a collection of pages are return the correct page.
   * @param {string} model 
   * @param {string} sort 
   * @param {boolean} reversed 
   * @returns {Array<Model>}
   */
  paginate(model, sort, reversed) {
    const { perPage } = this.paginationConfig;
    
    const collection = !sort
      ? this[model]
      : this[model].sort((a, b) => b[sort] - a[sort]);

    const finalCollection = !reversed
      ? collection
      : collection.reverse();

    const factory = [];

    for (let i = 0; i < finalCollection.length; i += perPage) {
      factory.push(finalCollection.slice(i, i + perPage));
    }

    return factory;
  }

  /* Retrieval */
  /**
   * @method getModel
   * @desc Given an id, return a single model.
   * @param {number} id
   * @returns {?Model}
   */
  getModel(model, id) {
    return this[model].find(model => model.id === id) || null;
  }

  /**
   * @method getModels
   * @desc Given a model type, return a collection of that type.
   * @param {string} model 
   * @param {string} sort       What property should the collection sort by?
   * @param {boolean} reversed  Should the collection be reversed?
   * @returns {Array<Model>}
   */
  getModels(model, page = 0, sort, reversed) {
    const collection = this.paginate(model, sort, reversed);

    return { collection: collection[page], collectionSize: collection.length };
  }

  /**
   * @method getModelsFromIds
   * @desc Given an array of IDs, translate those IDs to models.
   * @param {string} model 
   * @param {Array<string>} ids 
   * @returns {Array<Model>}
   */
  getModelsFromIds(model, ids) {
    const valid = ids.reduce((acc, cur) => { acc[cur] = 1; return acc; }, {});
    
    return this[model].filter(({ id }) => valid[id]);
  }

  getMapmarkers() {
    return this.headshops
  }
}

const app = (new API()).generateApp();