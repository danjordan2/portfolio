//================================================
// Dependencies
//================================================
var config = require('../config'),
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    nodemailer = require('nodemailer'),
    dbAddress = config.db.address;
//========= index ================================
// Loads static html page containing angular app 
//================================================
exports.index = function(req, res) {
    res.sendfile('public/index.html');
};
//========= resume_pdf ===========================
// Reads the contents of resume_html, and converts
// the html to a pdf file using wkhtmltopdf. The 
// file is then piped into the response.  
//================================================
exports.resume_pdf = function(req, res) {
    var wkhtmltopdf = require('wkhtmltopdf');
    wkhtmltopdf(config.resume.htmlPath, {
        pageSize: 'letter'
    }).pipe(res);
};
//========= resume_html ==========================
// Fetches the resume document from the database
// and renders an html layout with the data.
//================================================
exports.resume_html = function(req, res) {
    MongoClient.connect(dbAddress, function(err, db) {
        db.collection("resume").find().toArray(function(err, resume) {
            res.render('resume_html', resume[0]);
        });
    });
};
//========= api_header ===========================
// Returns a json object containing the contact
// info inside the page header
//================================================
exports.api_header = function(req, res) {
    MongoClient.connect(dbAddress, function(err, db) {
        db.collection("resume").find().toArray(function(err, resume) {
            res.json(resume[0].contact);
        });
    });
};
//========= api_resume ===========================
// Returns a json object containing the resume
// document stored in the database. 
//================================================
exports.api_resume = function(req, res) {
    MongoClient.connect(dbAddress, function(err, db) {
        db.collection("resume").find().toArray(function(error, resume) {
            resume[0]["last_modified"] = new ObjectID(resume[0]._id).getTimestamp();
            res.json(resume[0]);
        });
    });
};
//========= api_projects =========================
// Returns a json object containing an array of
// all projects stored in the database. 
//================================================
exports.api_projects = function(req, res) {
    MongoClient.connect(dbAddress, function(err, db) {
        db.collection("projects").find().toArray(function(error, projects) {
            if (error) {
                res.json({
                    error: error
                });
            } else {
                res.json(projects);
            }
        });
    });
};
//========= api_project ==========================
// Returns a json object for a single project, 
// based on the project name passed in by the user
//================================================
exports.api_project = function(req, res) {
    MongoClient.connect(dbAddress, function(err, db) {
        db.collection("projects").findOne({
            "folder": req.params.project
        }, function(error, project) {
            if (error) {
                res.json({
                    error: error
                });
            } else {
                res.json(project);
            }
        });
    });
};
//========= api_contact ==========================
// Accepts posted data from the contact form. The 
// function securely authenticates with google,
// and sends a formatted message. A json object is
// returned, containing a status and message to be
// displayed on the page after submitting the form.
//================================================
exports.api_contact = function(req, res) {
    var smtpTransport = nodemailer.createTransport("SMTP", {
        service: "Gmail",
        auth: {
            user: config.mailer.email,
            pass: config.mailer.pass
        }
    }).sendMail({
        from: req.body.name + "<" + req.body.email + ">",
        to: config.mailer.to,
        replyTo: req.body.name + "<" + req.body.email + ">",
        subject: req.body.subject,
        html: "Name: " + req.body.name + "<br/>" + "Email: " + req.body.email + "<br/>" + "Message: " + req.body.message + "<br/><br/><br/>---------<br/>" + "Sent from " + req.headers['x-forwarded-for']
    }, function(error, response) {
        if (error) {
            res.json({
                message: "Message could not be delivered. Please try again",
                status: "error"
            });
        } else {
            res.json({
                message: "Thank you. Your message has been received",
                status: "success"
            });
        }
    });
};