const mongoose = require('mongoose');
const BcryptJs = require('bcryptjs');

const config = require('../config');
const UserRole = require('../constants/user-role');

async function main() {
  const connection = await mongoose.connect(config.database.connection, config.database.option);
  require('../modules/auto-increment').init(connection);

  // require models after auto-increment init
  const UserModel = require('../models/user');

  const email = 'son.2274802010757@vanlanguni.vn'.trim().toLowerCase();
  const plainPassword = '123456';

  const salt = BcryptJs.genSaltSync(16);
  const password = BcryptJs.hashSync(plainPassword, salt);

  const updated = await UserModel.findOneAndUpdate(
    { email },
    {
      $set: {
        password,
        isDeleted: false
      },
      $addToSet: {
        roles: UserRole.admin
      },
      $setOnInsert: {
        fullname: 'Son Admin',
        email
      }
    },
    { new: true, upsert: true }
  ).lean();

  console.log(`Updated user: ${email} (id=${updated?.id || 'unknown'})`);
  console.log('Password reset to: 123456');
  console.log('Role ensured: ADMIN');
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});

