/**
 * @desc
 * Glassfinder models:
 *    1. HEADSHOP
 *      a. Has many ARTIST, and
 *      b. Has many COMPANY, and
 *      c. Has many PIECE
 * 
 *    2. ARTIST
 *      a. Has many HEADSHOP, and
 *      b. Has many COMPANY, and
 *      c. Has many PIECE
 * 
 *    3. COMPANY
 *      a. Has many HEADSHOP, and
 *      a. Has many ARTIST, and
 *      c. Has many PIECE
 * 
 *    4. PIECE
 *      a. Has one HEADSHOP, or
 *      b. Has one ARTIST, or
 *      c. Has one COMPANY
 */
class Model {
  constructor(config) {
    this.id = null;
    this.name = null;
    this.image = null;
    this.phone = null;
    this.email = null;
    this.tagline = null;
    this.description = null;
    this.memberSince = null;
    this.rating = null;
    this.address = null;
    this.position = null;
    this.images = null;
    this.associations = [];

    Object.assign(this, config);
  }
}

module.exports = [
  {
    singular: 'headshop',
    plural: 'headshops',
    class: class Headshop extends Model {
      constructor(config) {
        super(config);
        
        this.artists = [];
        this.companies = [];
        this.pieces = [];
      }
    },
  },
  {
    singular: 'artist',
    plural: 'artists',
    class: class Artist extends Model {
      constructor(config) {
        super(config);
        
        this.headshops = [];
        this.companies = [];
        this.pieces = [];
      }
    },
  },
  {
    singular: 'company',
    plural: 'companies',
    class: class Company extends Model {
      constructor(config) {
        super(config);
        
        this.headshops = [];
        this.artists = [];
        this.pieces = [];
      }
    },
  },
  {
    singular: 'pieces',
    plural: 'pieces',
    class: class Piece extends Model {
      constructor(config) {
        super(config);

        delete this.phone;
        delete this.email;
        delete this.memberSince;
        delete this.address;
        delete this.position;

        this.headshops = [];
        this.artists = [];
        this.companies = [];
      }
    },
  },
];