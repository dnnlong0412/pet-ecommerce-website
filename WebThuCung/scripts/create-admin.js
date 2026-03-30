const mongoose = require('mongoose');
const BcryptJs = require('bcryptjs');

const config = require('../config');
const UserRole = require('../constants/user-role');

async function main() {
  const connection = await mongoose.connect(config.database.connection, config.database.option);
  require('../modules/auto-increment').init(connection);

  // IMPORTANT: require models after auto-increment init
  const UserModel = require('../models/user');

  const email = 'son.2274802010757@vanlanguni.vn'.trim().toLowerCase();
  const plainPassword = '123456';

  const existed = await UserModel.findOne({ email }).lean();
  if (existed && existed.id) {
    console.log(`User already exists: ${email} (id=${existed.id})`);
    await mongoose.disconnect();
    return;
  }

  const salt = BcryptJs.genSaltSync(16);
  const password = BcryptJs.hashSync(plainPassword, salt);

  const created = await UserModel.create({
    fullname: 'Son Admin',
    email,
    password,
    roles: [UserRole.admin],
    isDeleted: false
  });

  console.log(`Created admin user: ${email} (id=${created.id})`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});

