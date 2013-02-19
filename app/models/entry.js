// Entry schema

var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var getTags = function (tags) {
  return tags.join(',')
}

var setTags = function (tags) {
  return tags.split(',')
}

var EntrySchema = new Schema({
    title: {type : String, default : '', trim : true}
  , lead: {type : String, default : '', trim : true}
  , user: {type : Schema.ObjectId, ref : 'User'}
  , comments: [{type : Schema.ObjectId, ref : 'Comment'}]
  , tags: {type: [], get: getTags, set: setTags}
  , image: {
        cdnUri: String
      , files: []
    }
  , categories: []
  , createdAt  : {type : Date, default : Date.now}
})

EntrySchema.path('title').validate(function (title) {
  return title.length > 0
}, 'Entry title cannot be blank')

EntrySchema.path('lead').validate(function (lead) {
  return lead.length > 0
}, 'Entry lead cannot be blank')



mongoose.model('Entry', EntrySchema)
