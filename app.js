const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const expressSanitizer = require("express-sanitizer")
const methodOverride = require("method-override")
const mongoose = require("mongoose")
const nodemailer = require('nodemailer')


//mongoose.connect("mongodb://localhost:27017/blog_app", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

mongoose.connect("mongodb+srv://blog:blog123@mongodbtrial-bxegw.mongodb.net/test?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
    useCreateIndex: true
}).then( () => {
    console.log("Connected to DB!")
}).catch( err => {
    console.log("Error:", err.message)
}) 


app.set("view engine", 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(expressSanitizer()) //should be mount after the bodyParser
app.use(express.static("public"))
app.use(methodOverride("_method"))

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})

var Blog = mongoose.model("Blog", blogSchema)

// RESTful Routes
app.get("/", (req, res) => {
    res.redirect("/blogs")
})

// SHOW Route
app.get("/blogs", (req, res) => {
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err)
        }else{
            res.render("index", {blogs: blogs})
        }
    })
})

app.get("/blogs/new", (req, res) => {
    res.render("newblogs")
})

// CREATE Route
app.post("/blogs", (req, res) => {
    
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new")
        }else{
            res.redirect("/blogs")
        }
    })
})

// SHOW Route
app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, function(err, showBlogs){
        if(err){
            res.redirect("/blogs")
        }else{
            res.render("showblogs", {blog: showBlogs})
        }
    })
})

app.get("/blogs/:id/edit", (req, res)  => {
    
    Blog.findById(req.params.id, function(err, editBlog){
        if(err){
            res.redirect("/blogs")
        }else{
            res.render("editform", {blog: editBlog})
        }
    })
    
})


// UPDATE Route
app.put("/blogs/:id", (req, res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog /*update*/, function(err, updateBlog){
        if(err){
            res.redirect("/blogs")
        }else{
            res.redirect("/blogs/" + req.params.id)
        }
    })
})

// DELETE Route
app.delete("/blogs/:id", (req, res) => {
    
    Blog.findByIdAndRemove(req.params.id, function(err, deleteBlog){
        if(err){
            res.redirect("/blogs")
        }else{
            res.redirect("/blogs")
        }
    })
})

app.get("/contact", (req, res) => {
    
    const mail = "mohitdass589@gmail.com"
    
    res.render("contact", {mail: mail})
})



// Form Routes

app.get("/welcome", (req, res) => {
    res.render("thankyou")
})

app.post("/send", (req, res) => {
    
    const output = `
        <p>Form Submission Request Here!</p>
        <h3>Contact Details</h3>
        <ul>
            <li><b>Name:</b> ${req.body.name}</li>
            <li><b>Email Id:</b> ${req.body.email}</li>
            <li><b>Class:</b> ${req.body.query}</li>
        </ul>
        <em>The Nodemailer Setup.</em>
    `;
    
    let transporter = nodemailer.createTransport({
        service: "Gmail", 
        port: 465,
        secure: true, 
        auth: {
            user: 'goodwinmohit@gmail.com', // generated ethereal user
            pass: 'otvtggkmalgirwpj' // generated ethereal password
        }
    });
    
    let mailOptions = {
      from: '"Nodemailer is Safe 👻" <goodwinmohit@gmail.com>', // sender address
      to: 'mohitdass589@gmail.com', // list of receivers
      subject: 'NodeApp Contact Request', // Subject line
      text: 'Hello world?', // plain text body
      html: output // html body
    };
    
        // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);   
        res.redirect('/welcome')
    });
})



app.get("*", (req, res) => {
    res.send("404 error")
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("Server is listening....")
})













