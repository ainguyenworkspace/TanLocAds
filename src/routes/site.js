const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { readData } = require('../data/store');
const { sendContactEmail } = require('../utils/mailer');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Bạn gửi yêu cầu quá nhiều lần, vui lòng thử lại sau.'
});

router.get('/', (req, res) => {
  const data = readData();
  res.render('pages/home', {
    title: `${data.company.brandName} - ${data.company.slogan}`,
    description: `${data.company.legalName} - Chuyên bảng hiệu, hộp đèn, đèn LED, cắt CNC/laser, in kỹ thuật số tại An Giang.`,
    company: data.company,
    services: data.services,
    portfolio: data.portfolio.slice(0, 4),
    blog: data.blog.slice(0, 3)
  });
});

router.get('/gioi-thieu', (req, res) => {
  const data = readData();
  res.render('pages/about', {
    title: `Giới thiệu - ${data.company.brandName}`,
    description: `Tìm hiểu về ${data.company.legalName}, đơn vị chuyên thi công bảng hiệu quảng cáo uy tín tại An Giang.`,
    company: data.company
  });
});

router.get('/dich-vu', (req, res) => {
  const data = readData();
  res.render('pages/services', {
    title: `Dịch vụ - ${data.company.brandName}`,
    description: 'Bảng hiệu, hộp đèn, đèn LED, cắt CNC/laser, chữ nổi, in kỹ thuật số, in UV, in khổ lớn.',
    company: data.company,
    services: data.services
  });
});

router.get('/bang-gia', (req, res) => {
  const data = readData();
  res.render('pages/pricing', {
    title: `Bảng giá - ${data.company.brandName}`,
    description: 'Bảng giá tham khảo dịch vụ bảng hiệu, đèn LED, in ấn của Tan Loc Advertising.',
    company: data.company,
    pricing: data.pricing
  });
});

router.get('/du-an', (req, res) => {
  const data = readData();
  res.render('pages/portfolio', {
    title: `Dự án đã thực hiện - ${data.company.brandName}`,
    description: 'Các dự án bảng hiệu, backdrop, in ấn tiêu biểu đã thi công.',
    company: data.company,
    portfolio: data.portfolio
  });
});

router.get('/du-an/:slug', (req, res) => {
  const data = readData();
  const item = data.portfolio.find((p) => p.slug === req.params.slug);
  if (!item) return res.status(404).render('pages/404', { title: 'Không tìm thấy trang', company: data.company });
  res.render('pages/portfolio-detail', {
    title: `${item.title} - ${data.company.brandName}`,
    description: item.description,
    company: data.company,
    item
  });
});

router.get('/blog', (req, res) => {
  const data = readData();
  res.render('pages/blog', {
    title: `Blog - ${data.company.brandName}`,
    description: 'Kiến thức, kinh nghiệm về bảng hiệu quảng cáo và in ấn.',
    company: data.company,
    posts: [...data.blog].sort((a, b) => new Date(b.date) - new Date(a.date))
  });
});

router.get('/blog/:slug', (req, res) => {
  const data = readData();
  const post = data.blog.find((p) => p.slug === req.params.slug);
  if (!post) return res.status(404).render('pages/404', { title: 'Không tìm thấy trang', company: data.company });
  res.render('pages/blog-detail', {
    title: `${post.title} - ${data.company.brandName}`,
    description: post.excerpt,
    company: data.company,
    post
  });
});

router.get('/tuyen-dung', (req, res) => {
  const data = readData();
  res.render('pages/careers', {
    title: `Tuyển dụng - ${data.company.brandName}`,
    description: 'Cơ hội việc làm tại Tan Loc Advertising.',
    company: data.company,
    jobs: data.jobs
  });
});

router.get('/lien-he', (req, res) => {
  const data = readData();
  res.render('pages/contact', {
    title: `Liên hệ - ${data.company.brandName}`,
    description: 'Liên hệ Tan Loc Advertising để được tư vấn và báo giá miễn phí.',
    company: data.company,
    sent: false,
    error: null,
    old: {}
  });
});

router.post('/lien-he', contactLimiter, async (req, res) => {
  const data = readData();
  const { name, phone, email, message, website } = req.body;

  if (website) {
    return res.redirect('/lien-he');
  }

  if (!name || !phone || !message) {
    return res.status(400).render('pages/contact', {
      title: `Liên hệ - ${data.company.brandName}`,
      description: 'Liên hệ Tan Loc Advertising để được tư vấn và báo giá miễn phí.',
      company: data.company,
      sent: false,
      error: 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Nội dung.',
      old: { name, phone, email, message }
    });
  }

  try {
    await sendContactEmail({ name, phone, email, message });
  } catch (err) {
    console.error('[contact] gửi email thất bại:', err.message);
    return res.status(500).render('pages/contact', {
      title: `Liên hệ - ${data.company.brandName}`,
      description: 'Liên hệ Tan Loc Advertising để được tư vấn và báo giá miễn phí.',
      company: data.company,
      sent: false,
      error: 'Có lỗi khi gửi yêu cầu, vui lòng gọi trực tiếp hotline hoặc thử lại sau.',
      old: { name, phone, email, message }
    });
  }

  res.render('pages/contact', {
    title: `Liên hệ - ${data.company.brandName}`,
    description: 'Liên hệ Tan Loc Advertising để được tư vấn và báo giá miễn phí.',
    company: data.company,
    sent: true,
    error: null,
    old: {}
  });
});

module.exports = router;
