
var mongoose = require('mongoose')
  , Imager = require('imager')
  , async = require('async')
  , Entry = mongoose.model('Entry')
  , _ = require('underscore')

// New article
exports.new = function(req, res){
  res.render('entries/new', {
      title: 'New Entry'
    , entry: new Entry({})
  })
}


// Create an entry
exports.create = function (req, res) {
  var entry = new Entry(req.body)
    , imagerConfig = require('../../config/imager')
    , imager = new Imager(imagerConfig, 'S3')

  entry.user = req.user

  imager.upload(req.files.image, function (err, cdnUri, files) {
    if (err) return res.render('400')
    if (files.length) {
      entry.image = { cdnUri : cdnUri, files : files }
    }
    entry.save(function(err){
      if (err) {
        res.render('entries/new', {
            title: 'New Entry'
          , entry: entry
          , errors: err.errors
        })
      }
      else {
        res.redirect('/entries/'+entry._id)
      }
    })
  }, 'entry')
}


// Edit an entry
exports.edit = function (req, res) {
  res.render('entries/edit', {
    title: 'Edit '+req.entry.title,
    entry: req.entry
  })
}


// Update entry
exports.update = function(req, res){
  var entry = req.entry

  entry = _.extend(entry, req.body)

  entry.save(function(err, doc) {
    if (err) {
      res.render('entries/edit', {
          title: 'Edit Article'
        , article: article
        , errors: err.errors
      })
    }
    else {
      res.redirect('/entries/'+entry._id)
    }
  })
}


// View an entry
exports.show = function(req, res){
  console.log('trying to get one entry', req)

  res.render('entries/show', {
    title: req.entry.title,
    entry: req.entry,
    comments: req.comments
  })
}


// Delete an entry
exports.destroy = function(req, res){
  var entry = req.entry
  entry.remove(function(err){
    // req.flash('notice', 'Deleted successfully')
    res.redirect('/entries')
  })
}


// Listing of entries
exports.index = function(req, res){
  var perPage = 5
    , page = req.param('page') > 0 ? req.param('page') : 0

  Entry
    .find({})
    .populate('user', 'name')
    .sort({'createdAt': -1}) // sort by date
    .limit(perPage)
    .skip(perPage * page)
    .exec(function(err, entries) {

console.log('i found some entries', entries );

      console.log('unable to display index',err);
      if (err) return res.render('500')
      Entry.count().exec(function (err, count) {
        res.render('entries/index', {
            title: 'List of entries'
          , entries: entries
          , page: page
          , pages: count / perPage
        })
      })
    })
}

exports.test = function(req, res, next, id){
  console.log('testme')
}
// find requested entry
exports.entry = function(req, res, next, id){
  var User = mongoose.model('User')
  console.log('getting entry',id, req)
  Entry
    .findOne({ _id : id })
    .populate('user', 'name')
    .populate('comments')
    .exec(function (err, entry) {
      console.log('got entry',entry)
      if (err) return next(err)
      if (!entry) return next(new Error('Failed to load entry ' + id))
      req.entry = entry

    next()
/*
      var populateComments = function (comment, cb) {
        User
          .findOne({ _id: comment._user })
          .select('name')
          .exec(function (err, user) {
            if (err) return next(err)
            comment.user = user
            cb(null, comment)
          })
      }

      if (entry.comments.length) {
        async.map(req.entry.comments, populateComments, function (err, results) {
          next(err)
        })
      }
      else
        next()
*/

    })
}
