const authorModel = require("../models/authorModel");
const jwt = require("jsonwebtoken");

//==================================== createAuthor ===================================================
const createAuthor = async function (req, res) {
    try {
        let data = req.body
        let email = req.body.email
        let password = req.body.password

        //Case 1 = if Client/User gives Blank body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({
                status: false,
                msg: "fname,lname,title,email,password Not FOUND"
            })
        }

        //regEx
        let strRegex =/^\w[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/;
        let mailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;


        // case 2 =  if Client/User not add First Name or if Number add in place of string 
        if (!data.fname || typeof (data.fname) != 'string' || !data.fname.match(strRegex)) {
            return res.status(400).send({
                status: false,
                msg: "fname is must with valid formate"
            })
        }

        // case 3 =  if Client/User not add last Name or if Number add in place of string 
        if (!data.lname || typeof (data.lname) != 'string' || !data.lname.match(strRegex)) {
            return res.status(400).send({
                status: false,
                msg: "lname is must with valid formate"
            })
        }

        // case 4 =  if Client/User not add titles || if Number add in place of string || if its not Mr, Mrs, Miss
        if (!data.title || data.title != ("Mr" || "Mrs" || "Miss")) {
            // !data.title.match(strRegex)
            return res.status(400).send({
                status: false,
                msg: "Title is must with Mr, Mrs, Miss"
            })
        }

        // case 5 = if Client/User not add email || if email is Invalid || if email is already exit 
        if (typeof (data.email) != 'string' || !data.email || !email.match(mailRegex)) {
            return res.status(400).send({
                status: false,
                msg: "Please add the email with valid formate"
            })
        }

        let mail = await authorModel.findOne({ email: email })
        if (mail) {
            return res.status(400).send({
                status: false,
                msg: "This email id already used"
            })
        }

        // case 6 = if Client/User not add passWord || if password is not match consdition of 8 char atleast 1 letter 1 no
        if (!data.password || !password.match(passRegex)) {
            return res.status(400).send({
                status: false,
                msg: "Password Must Contain Eight Characters,At least One UpperCase letter ,One Number,One Special Char"
            })
        }

        let createAuth = await authorModel.create(data);
        res.status(201).send({ status: true, data: createAuth });

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

//================POST /login======================================================================

const login = async function (req, res) {
    try {
        let data = req.body;
        let userName = req.body.email;
        let passWord = req.body.password;
        if (Object.keys(data).length == 0) {
            return res.status(400).send({
                status: false,
                msg: "Usermail Password Not Found"
            })
        }
        if (!userName) {
            return res.status(400).send({
                status: false,
                msg: "please add the Useremail"
            })
        }
        if (!passWord) {
            return res.status(400).send({
                status: false,
                msg: "please add the passWord"
            })
        }
        let author = await authorModel.findOne({ email: userName, password: passWord });
        if (!author) {
            return res.status(401).send({
                status: false,
                msg: "The Usermail or password you entered isn't connected to an account.",
            })
        }
        //Token Creation 
        let token = jwt.sign(
            {
                userId: author._id,
                userName: author.email,
                passWord: author.password
            },
            "Room-8-Radon");
        res.setHeader("x-api-key", token);
        return res.status(200).send({ status: true, data: token });
    }
    catch (error) {
        return res.status(500).send({ msg: "Error", error: error.message })
    }
};

module.exports.createAuthor = createAuthor

module.exports.login = login    