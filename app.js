  const express = require('express');
  const bodyParser = require('body-parser');
  
  const MODELS = require('./models');
  const { SEQUELIZE, User, generateDefaultAttributes } = require('./sequelize');

  /**
   * @function
   * @desc Create the API application and listen in on a given port.
   * @param {number} port 
   * @returns {Express}
   */
  module.exports = function generateApp(port = process.env.PORT || 6166) {
    const app = express();

    /*
      M i d d l e w a r e
    */
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(bodyParser.json());

    /*
      U s e r
        M a n a g e m e n t
    */
    app.post('/signup', async ({ body }, res) => {
      const {
        signupFormEmail,
        signupFormEmailAgain,
        signupFormPassword,
        signupFormPasswordAgain,
      } = body;

      console.log('Got result:', {
        signupFormEmail,
        signupFormEmailAgain,
        signupFormPassword,
        signupFormPasswordAgain,
      });

      try {
        await SEQUELIZE.sync();
        
        const user = await User.create(Object.assign(generateDefaultAttributes(), { email: signupFormEmail }));

        res.send({ success: true, data: { user } });
      } catch (e) {
        res.send({ success: false, error: e });
      }
    });

    /*
      M o d e l
        M a n a g e m e n t
    */
    MODELS.forEach(model => {
      // Master
      app.get(`/${model.plural}`, (req, res) => {
        const { page, sort, reversed, full } = req.query;
        const { collection, collectionSize } = this.getModels(model.plural, page, sort, reversed);

        res.send(JSON.stringify({ collection, collectionSize }));
      });

      // Detail
      app.get(`/${model.singular}/:id`, ({ params: { id } }, res) => {
        res.send(JSON.stringify(
          this.getModel(model.plural, id)
        ));
      });

      // ID -> Model
      app.get(`/${model.plural}ById/`, ({ query: { collection = '' } }, res) => {
        const ids = collection.split(',');

        res.send(JSON.stringify(
          this.getModelsFromIds(model.plural, ids)
        ));
      });
    });

    /*
      M a p
        M a n a g e m e n t
    */

    app.get('/mapmarkers', (req, res) => {
      res.send(JSON.stringify(
        this.getMapmarkers()
      ))
    });

    app.listen(port, console.info(`Glassfinder API listening on port ${port}.`));

    return app;
  }