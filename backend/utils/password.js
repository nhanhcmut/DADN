var generator = require("generate-password");

var bcrypt = require("bcryptjs")
const generateRandomPassword = () => {
    var password = generator.generate({
        length: 10,
        numbers: true,
    });
    return password
};

const getHashedPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}

module.exports = {generateRandomPassword, getHashedPassword}