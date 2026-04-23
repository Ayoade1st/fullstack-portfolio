const { Router } = require('express');
const portfolioController = require('../controllers/portfolio.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

// Public
router.get('/', portfolioController.getAllItems);
router.get('/:id', portfolioController.getItemById);

// Protected
router.get('/my/items', authenticate, portfolioController.getMyItems);
router.post('/', authenticate, portfolioController.createItem);
router.put('/:id', authenticate, portfolioController.updateItem);
router.delete('/:id', authenticate, portfolioController.deleteItem);

module.exports = router;
