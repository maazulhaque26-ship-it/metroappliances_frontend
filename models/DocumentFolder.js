'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentFolderSchema = new Schema({
  folderCode:   { type: String, unique: true },
  name:         { type: String, required: true, trim: true },
  description:  { type: String, default: '' },
  parent:       { type: Schema.Types.ObjectId, ref: 'DocumentFolder', default: null },
  path:         { type: String, default: '/' },
  depth:        { type: Number, default: 0 },
  module:       { type: String, enum: ['hr','finance','projects','manufacturing','procurement','warehouse','service','qms','eam','crm','general','all'], default: 'all' },
  owner:        { type: Schema.Types.ObjectId, ref: 'User' },
  color:        { type: String, default: '#6366f1' },
  icon:         { type: String, default: 'folder' },
  isPublic:     { type: Boolean, default: true },
  documentCount:{ type: Number, default: 0 },
  isDeleted:    { type: Boolean, default: false },
}, { timestamps: true });

documentFolderSchema.index({ parent: 1 });
documentFolderSchema.index({ path: 1 });
documentFolderSchema.index({ module: 1 });

documentFolderSchema.pre('validate', async function (next) {
  if (this.isNew && !this.folderCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentFolder').countDocuments();
    this.folderCode = `FLD-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DocumentFolder', documentFolderSchema);
