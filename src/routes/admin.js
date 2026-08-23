const express = require('express');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { readData, writeData, slugify } = require('../data/store');
const { requireAdmin } = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Đăng nhập quá nhiều lần, vui lòng thử lại sau.'
});

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', 'public', 'images', 'portfolio'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExt}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) return cb(null, true);
    cb(new Error('Chỉ chấp nhận file ảnh JPG, PNG hoặc WEBP.'));
  }
});

router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/admin');
  res.render('admin/login', { title: 'Đăng nhập quản trị', error: null });
});

router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  res.status(401).render('admin/login', { title: 'Đăng nhập quản trị', error: 'Sai tên đăng nhập hoặc mật khẩu.' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.use(requireAdmin);

router.get('/', (req, res) => {
  const data = readData();
  res.render('admin/dashboard', {
    title: 'Bảng điều khiển quản trị',
    counts: {
      portfolio: data.portfolio.length,
      blog: data.blog.length,
      jobs: data.jobs.length,
      services: data.services.length
    }
  });
});

// ---- Portfolio ----
router.get('/du-an', (req, res) => {
  const data = readData();
  res.render('admin/portfolio-list', { title: 'Quản lý dự án', portfolio: data.portfolio });
});

router.get('/du-an/moi', (req, res) => {
  res.render('admin/portfolio-form', { title: 'Thêm dự án', item: null });
});

router.post('/du-an/moi', upload.single('image'), (req, res) => {
  const data = readData();
  const { title, category, description } = req.body;
  const slug = slugify(title);
  data.portfolio.unshift({
    slug,
    title,
    category,
    description,
    image: req.file ? `/images/portfolio/${req.file.filename}` : '/images/portfolio/placeholder.jpg'
  });
  writeData(data);
  res.redirect('/admin/du-an');
});

router.get('/du-an/:slug/sua', (req, res) => {
  const data = readData();
  const item = data.portfolio.find((p) => p.slug === req.params.slug);
  if (!item) return res.redirect('/admin/du-an');
  res.render('admin/portfolio-form', { title: 'Sửa dự án', item });
});

router.post('/du-an/:slug/sua', upload.single('image'), (req, res) => {
  const data = readData();
  const item = data.portfolio.find((p) => p.slug === req.params.slug);
  if (item) {
    item.title = req.body.title;
    item.category = req.body.category;
    item.description = req.body.description;
    if (req.file) item.image = `/images/portfolio/${req.file.filename}`;
    writeData(data);
  }
  res.redirect('/admin/du-an');
});

router.post('/du-an/:slug/xoa', (req, res) => {
  const data = readData();
  data.portfolio = data.portfolio.filter((p) => p.slug !== req.params.slug);
  writeData(data);
  res.redirect('/admin/du-an');
});

// ---- Blog ----
router.get('/blog', (req, res) => {
  const data = readData();
  res.render('admin/blog-list', { title: 'Quản lý blog', posts: data.blog });
});

router.get('/blog/moi', (req, res) => {
  res.render('admin/blog-form', { title: 'Viết bài mới', post: null });
});

router.post('/blog/moi', (req, res) => {
  const data = readData();
  const { title, excerpt, content, author } = req.body;
  data.blog.unshift({
    slug: slugify(title),
    title,
    excerpt,
    content,
    author: author || data.company.brandName,
    date: new Date().toISOString().slice(0, 10)
  });
  writeData(data);
  res.redirect('/admin/blog');
});

router.get('/blog/:slug/sua', (req, res) => {
  const data = readData();
  const post = data.blog.find((p) => p.slug === req.params.slug);
  if (!post) return res.redirect('/admin/blog');
  res.render('admin/blog-form', { title: 'Sửa bài viết', post });
});

router.post('/blog/:slug/sua', (req, res) => {
  const data = readData();
  const post = data.blog.find((p) => p.slug === req.params.slug);
  if (post) {
    post.title = req.body.title;
    post.excerpt = req.body.excerpt;
    post.content = req.body.content;
    writeData(data);
  }
  res.redirect('/admin/blog');
});

router.post('/blog/:slug/xoa', (req, res) => {
  const data = readData();
  data.blog = data.blog.filter((p) => p.slug !== req.params.slug);
  writeData(data);
  res.redirect('/admin/blog');
});

// ---- Jobs ----
router.get('/tuyen-dung', (req, res) => {
  const data = readData();
  res.render('admin/jobs-list', { title: 'Quản lý tuyển dụng', jobs: data.jobs });
});

router.get('/tuyen-dung/moi', (req, res) => {
  res.render('admin/jobs-form', { title: 'Thêm tin tuyển dụng', job: null });
});

router.post('/tuyen-dung/moi', (req, res) => {
  const data = readData();
  const { title, type, location, description, requirements } = req.body;
  data.jobs.unshift({
    slug: slugify(title),
    title,
    type,
    location,
    description,
    requirements: requirements ? requirements.split('\n').map((r) => r.trim()).filter(Boolean) : []
  });
  writeData(data);
  res.redirect('/admin/tuyen-dung');
});

router.post('/tuyen-dung/:slug/xoa', (req, res) => {
  const data = readData();
  data.jobs = data.jobs.filter((j) => j.slug !== req.params.slug);
  writeData(data);
  res.redirect('/admin/tuyen-dung');
});

// ---- Company info & pricing ----
router.get('/cai-dat', (req, res) => {
  const data = readData();
  res.render('admin/settings', { title: 'Cài đặt thông tin công ty', company: data.company, pricing: data.pricing });
});

router.post('/cai-dat', (req, res) => {
  const data = readData();
  const { legalName, brandName, phone, email, address, slogan, tagline, facebook, zalo, workingHours } = req.body;
  data.company = { legalName, brandName, phone, email, address, slogan, tagline, facebook, zalo, workingHours };
  writeData(data);
  res.redirect('/admin/cai-dat');
});

module.exports = router;
