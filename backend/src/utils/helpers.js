const generateReferralCode = () => {
  return 'REF' + Math.random().toString(36).substring(2, 10).toUpperCase();
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { generateReferralCode, generateOtp };
