require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'supersecretjwtkey_change_in_production';
const FINE_PER_DAY = 2; // $2 per day late

// Middleware
app.use(cors());
app.use(express.json());

// SQLite Connection via Sequelize (Stores data locally in library.sqlite)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './library.sqlite',
  logging: false
});

// Models
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'student' },
  fines: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const Book = sequelize.define('Book', {
  title: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING, allowNull: false },
  genre: { type: DataTypes.STRING, defaultValue: 'General' },
  status: { type: DataTypes.STRING, defaultValue: 'Available' },
  borrowedBy: { type: DataTypes.INTEGER, allowNull: true },
  dueDate: { type: DataTypes.DATE, allowNull: true }
});

// Relationships
User.hasMany(Book, { foreignKey: 'borrowedBy', as: 'borrowedBooks' });
Book.belongsTo(User, { foreignKey: 'borrowedBy', as: 'borrower' });

// Sync DB and Seed Admin
sequelize.sync().then(async () => {
  console.log('SQLite Database synced successfully.');
  const adminExists = await User.findOne({ where: { role: 'admin' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', password: hashedPassword, role: 'admin' });
    console.log('Default admin created (username: admin, password: admin123)');
  }
}).catch(err => console.error('DB Sync Error:', err));

// Middleware for Auth
const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    let user = await User.findOne({ where: { username } });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({ username, password: hashedPassword, role: role || 'student' });
    
    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, fines: user.fines } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Book Routes ---
app.get('/api/books', async (req, res) => {
  try {
    const { search } = req.query;
    let queryOptions = { include: [{ model: User, as: 'borrower', attributes: ['id', 'username'] }] };
    
    if (search) {
      queryOptions.where = {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { author: { [Op.like]: `%${search}%` } },
          { genre: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    const books = await Book.findAll(queryOptions);
    // Format to match old mongoose output for frontend compatibility
    const formattedBooks = books.map(b => {
      const bookData = b.toJSON();
      return {
        _id: bookData.id,
        title: bookData.title,
        author: bookData.author,
        genre: bookData.genre,
        status: bookData.status,
        dueDate: bookData.dueDate,
        borrowedBy: bookData.borrower ? { _id: bookData.borrower.id, username: bookData.borrower.username } : null
      };
    });
    res.json(formattedBooks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

app.post('/api/books', auth, adminOnly, async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/books/:id', auth, adminOnly, async (req, res) => {
  try {
    await Book.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/books/:id/borrow', auth, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book || book.status === 'Borrowed') return res.status(400).json({ message: 'Book not available' });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    await book.update({
      status: 'Borrowed',
      borrowedBy: req.user.id,
      dueDate: dueDate
    });
    
    res.json({ message: 'Book borrowed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/books/:id/return', auth, async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book || book.status === 'Available') return res.status(400).json({ message: 'Book already available' });

    if (book.dueDate && new Date() > book.dueDate) {
      const diffTime = Math.abs(new Date() - book.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const fineAmount = diffDays * FINE_PER_DAY;
      
      const user = await User.findByPk(book.borrowedBy);
      await user.update({ fines: user.fines + fineAmount });
    }

    await book.update({
      status: 'Available',
      borrowedBy: null,
      dueDate: null
    });
    
    res.json({ message: 'Book returned successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Library Backend running on port ${PORT}`);
});

// Keep event loop alive
setInterval(() => {}, 1000 * 60 * 60);
