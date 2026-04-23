const { Router } = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.get('/', authenticate, authorize('ADMIN'), userController.getAllUsers);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, authorize('ADMIN'), userController.deleteUser);

module.exports = router;
