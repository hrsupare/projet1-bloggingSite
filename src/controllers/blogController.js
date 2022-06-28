const mongoose = require("mongoose");
const blogModel = require("../models/blogsModel")
const authorModel = require("../models/authorModel")


const isValid = function (x) {
    if (typeof x === 'undefined' || x === null) return false
    if (typeof x === 'string' && x.trim().length === 0) return false
    return true
}
const isValidObjectId = function (x) {
    return mongoose.Types.ObjectId.isValid(x)
}
const isValidBody = function (y) {
    return Object.keys(y).length > 0
}

//============================= Create BLOG ==========================================================
const createBlog = async function (req, res) {
    try {
        let data = req.body
        let Id = req.body.authorId
        // body Must Be Present 
        if (!isValidBody(data)) {
            return res.status(404).send({
                status: false,
                msg: "Please Enter Data"
            })
        }
        // title Must Be Present with the string  
        if (!data.title || typeof (data.title) != 'string') {
            return res.status(400).send({
                status: false,
                msg: "Please Add Title in Valid Formate"
            })
        }
        // blog body Must Be Present 
        if (!data.body) {
            return res.status(400).send({
                status: false,
                msg: "Please Add Body"
            })
        }
        //author id must be Valid 
        if (!data.authorId || Id.length != 24) {
            return res.status(400).send({
                status: false,
                msg: "Author ID Not Present in Valid formate"
            })
        }
        // checking author is registered 
        let authId = await authorModel.findById({ _id: Id })
        if (!authId) {
            return res.status(401).send({
                status: false,
                msg: "No Registered Author Found With This Author Id"
            })
        }
        // category Must Be Present
        if (!data.category || typeof (data.category) != 'string') {
            return res.status(400).send({
                status: false,
                msg: "Please add category"
            })
        }
        // Database call 
        let blogCreated = await blogModel.create(data)
        res.status(201).send({ status: true, data: blogCreated })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

//=============================GET /blog ======================================================================
const getBlog = async function (req, res) {
    try {
        let data = req.query

        // if No single query given by user
        if (!data) {
            let allBlog = await blogModel.find({ isDeleted: false, isPublished: true })
            if (allBlog.length == 0) {
                return res.status(400).send({ status: "false", msg: "Blog Not Found" })
            }
            {
                return res.status(200).send({ status: true, msg: allBlog })
            }
        }
        //if user give query
        let getAllBlog = await blogModel.find({ $and: [{ isDeleted: false }, { isPublished: true }], $or: [data] })
        if (getAllBlog.length == 0) {
            return res.status(400).send({ status: "false", msg: "Blog Not Found" })
        }
        return res.status(200).send({ status: true, data: getAllBlog })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

//============================ PUT /blogs/:blogId / UPDATE  BLOG ==========================================================

const updateBlog = async function (req, res) {
    try {
        let data = req.body
        let id = req.params.blogId

        if (!Object.keys(data).length != 0) return res.status(400).send({ status: false, msg: "please Enter data" })
        // title Must Be Present with the string  
        if (typeof (data.title) != 'string') {
            return res.status(400).send({
                status: false,
                msg: "Please add Title in valid Formate"
            })
        }

        let blogId = await blogModel.findById(id)
        if (!blogId) return res.status(400).send({ status: false, msg: "No such User Exits" })

        if (blogId.isDeleted == true) {
            return res.status(400).send({ status: false, msg: "User is not Present / it's a deleted User" })
        }

        let updateTag = await blogModel.findOne({ _id: id }).select({ tags: 1, subCategory: 1, _id: 0 })
        //pushing the Element
        if (data.tags) { data.tags.push(...updateTag.tags) }
        if (data.subCategory) { data.subCategory.push(...updateTag.subCategory) }

        data[`isPublished`] = true
        data[`publishedAt`] = new Date();

        let updateData = await blogModel.findOneAndUpdate({ _id: id }, data, { new: true })
        return res.status(200).send({ status: true, data: updateData })
    }
    catch (error) {
        // console.log("This is the Error", error.message) 
        return res.status(500).send({ msg: "Error", error: error.message })
    }

}

//====================DELETE /blogs/:blogId===================================================================================

const deleteBlog = async function (req, res) {
    try {
        let id = req.params.blogId;
        // console.log(id)
        let user = await blogModel.findById({ _id: id });
        // console.log(user)
        if (!user) {
            return res.status(404).send("No such user exists");
        }
        if (!user.isDeleted == false) {
            return res.status(404).send({ err: "user is not present" })
        }
        let data = await blogModel.findByIdAndUpdate({ _id: id }, { $set: { isDeleted: true } }, { new: true })
        return res.status(200).send({ status: data, msg: "Blog Delete Successfully" })
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


//==================== DELETE /blogs?queryParams ===================================================================================

const deleteByQuery = async function (req, res) {
    try {
        let queryParam = req.query
        if (!isValidBody(queryParam)) {
            return res.status(400).send({
                status: false,
                msg: "Please enter details."
            })
        }
        let getAllBlog = await blogModel.updateMany({ $and: [queryParam, { isDeleted: false }] }, { $set: { isDeleted: true } }, { new: true })
        if (getAllBlog.modifiedCount == 0) {
            return res.status(400).send({ status: "false", msg: "Blog Not Found" })
        }

        return res.status(200).send({ data: getAllBlog })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

//========================== Exports ==============================


module.exports.createBlog = createBlog

module.exports.getBlog = getBlog

module.exports.updateBlog = updateBlog

module.exports.deleteBlog = deleteBlog

module.exports.deleteByQuery = deleteByQuery