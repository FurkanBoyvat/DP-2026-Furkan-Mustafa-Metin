const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token gerekli',
      code: 'NO_TOKEN'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arac_takip_sistemi_gizli_anahtar_2026_jwt_secret_key_cok_guvenli');
    req.kullanici = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Geçersiz veya süresi dolmuş token',
      code: 'INVALID_TOKEN'
    });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.kullanici.rol !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin yetkisi gerekli',
        code: 'UNAUTHORIZED'
      });
    }
    next();
  });
};

const verifySirketYoneticisi = (req, res, next) => {
  verifyToken(req, res, () => {
    if (!['admin', 'sirket_yoneticisi'].includes(req.kullanici.rol)) {
      return res.status(403).json({
        success: false,
        message: 'Şirket yöneticisi yetkisi gerekli',
        code: 'UNAUTHORIZED'
      });
    }
    next();
  });
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifySirketYoneticisi
};
