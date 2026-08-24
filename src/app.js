require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');

const siteRoutes = require('./routes/site');
const adminRoutes = require('./routes/admin');
const { readData } = require('./data/store');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { maxAge: isProd ? '7d' : 0 }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: 'auto',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30
    }
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.use('/admin', adminRoutes);
app.use('/', siteRoutes);

app.use((req, res) => {
  res.status(404).render('pages/404', { title: 'Không tìm thấy trang', company: readData().company });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
});

app.listen(PORT, () => {
  console.log(`Tan Loc Advertising website đang chạy tại http://localhost:${PORT}`);
});
