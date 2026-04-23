const portfolioService = require('../services/portfolio.service');

const getAllItems = async (req, res, next) => {
  try {
    const items = await portfolioService.getAllItems();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

const getMyItems = async (req, res, next) => {
  try {
    const items = await portfolioService.getItemsByUser(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

const getItemById = async (req, res, next) => {
  try {
    const item = await portfolioService.getItemById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Portfolio item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
};

const createItem = async (req, res, next) => {
  try {
    const { title, description, techStack, githubUrl, liveUrl, imageUrl, featured } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    const item = await portfolioService.createItem(req.user.id, {
      title, description,
      techStack: techStack || [],
      githubUrl, liveUrl, imageUrl,
      featured: featured || false,
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await portfolioService.updateItem(req.params.id, req.user.id, req.user.role, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    await portfolioService.deleteItem(req.params.id, req.user.id, req.user.role);
    res.json({ message: 'Portfolio item deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllItems, getMyItems, getItemById, createItem, updateItem, deleteItem };
