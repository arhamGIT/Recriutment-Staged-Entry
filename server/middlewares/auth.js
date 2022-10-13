const jwt = require('jsonwebtoken')
const connection = require('../db')

const protect = (req, res, next) => {
    // next()
    if (req.url === '/loginuser' || req.url === '/saveattendence' || req.method === 'GET' ) {
        next()
    } else {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) { //token would be something like  Bearer dsjklfauiyerwer;ldjfaoiuyseakjhabsdfjg
            try {
                const GET_USER_QUERY = "SELECT * FROM users WHERE UserID = ?"

                token = req.headers.authorization.split(" ")[1]
                // console.log(token);
                //decodes token
                const decoded = jwt.verify(JSON.parse(token), "kamran");
                // console.log(decoded);
                connection.query(GET_USER_QUERY, [decoded.id], (err, response) => {
                    if (err) console.log(err);
                    else {
                        if (response.length == 0) {
                            return res.sendStatus(203)
                        } else {
                            if (response[0].token === JSON.parse(token)) {
                                req.user = response[0]
                                next()
                            }else{
                                return res.sendStatus(203)
                            }
                        }
                    }
                })
            } catch (error) {
                console.log('catch error : ' + error);
                res.sendStatus(203)
                // console.log(error);
            }

        }
        if (!token) {
            console.log('Not Token Error');
            return res.sendStatus(203)
        }
    }
}

module.exports = { protect }