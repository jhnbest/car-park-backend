const bcrypt = require('bcryptjs');

/**
 * 生成bcrypt加密密码
 * @param {string} password - 明文密码
 * @param {number} saltRounds - 加密强度，默认10
 */
function generatePassword(password, saltRounds = 10) {
    if (!password) {
        console.error('请提供要加密的密码');
        process.exit(1);
    }

    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    console.log('明文密码:', password);
    console.log('加密后密码:', hashedPassword);
    console.log('SQL插入语句:');
    console.log(`INSERT INTO "sys_user" (username, password, role, status) VALUES ('admin', '${hashedPassword}', 'admin', 1);`);
}

// 从命令行参数获取密码
const password = process.argv[2];
generatePassword(password);