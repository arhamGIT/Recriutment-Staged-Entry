const jwt = require('jsonwebtoken')

const generateToken = (id) => {
   return jwt.sign({id},'kamran',{
    expiresIn:'30d'
   })
}
module.exports = generateToken
