const jwt = require('jsonwebtoken')
const blogModel = require("../models/blogsModel")
const authorModel = require("../models/authorModel")

//=================Authentication================================ 

let authentication = function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        //if Token Not Present  
        if (!token) {
            return res.status(400).send({
                status: false,
                msg: "Token Must be Present"
            })
        }
        let decodedToken = jwt.verify(token, "Room-8-Radon");
        //if token is Invalid 
        if (!decodedToken) {
            return res.status(401).send({
                status: false,
                msg: "token is invalid"
            })
        }

        req.authIdNew = decodedToken.userId

        next()
    } catch (error) {
        res.status(500).send({
            status: false,
            msg: "Error",
            error: error.message
        })

    }
}

//=============== Authorisation  ================================ 

const authorisation = async function (req, res, next) {
    try {
        let userLoggedIn = req.authIdNew
        let blogId = req.params.blogId
        let requestUser = req.params.authorId
       //blod update or delete 
        if (req.params.blogId) {
            if (req.params.blogId.length != 24) {return res.status(403).send({status: false,msg: 'invalid BlogId'})}
            let authId = await blogModel.findOne({ _id: blogId }).select({ authorId: 1, _id: 0 })
            if (!authId) { return res.status(403).send({ status: false, msg: 'Blog Id Not Found' })
            }
            let newAuth = authId.authorId.valueOf()
            if (newAuth != userLoggedIn) { return res.status(403).send({ status: false, msg: 'User logged is not allowed to modify the requested users data' }) }
        }
        // delete by query param 
        else if (req.params.authorId) {
            if (req.params.authorId.length != 24) {
                return res.status(403).send({
                    status: false,
                    msg: 'invalid authorId'
                })
            }
        if (requestUser != userLoggedIn) {
                return res.status(403).send({
                    status: false,
                    msg: 'User logged is not allowed to modify the requested users data'
                })
            }
        }
        next()
    } catch (error) {
        res.status(500).send({
            status: false,
            msg: "Error",
            error: error.message
        })

    }

}


//========================== Exports ============================== 

module.exports.authentication = authentication

module.exports.authorisation = authorisation

