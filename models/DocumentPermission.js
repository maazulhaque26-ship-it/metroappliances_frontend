'use strict';
const mongoose = require('mongoose');
const { Schema } = mongoose;

const documentPermissionSchema = new Schema({
  permissionCode: { type: String, unique: true },
  document:       { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  // Who gets access
  grantedTo:      { type: Schema.Types.ObjectId, ref: 'User' },
  grantedRole:    { type: String, default: '' },
  grantedDept:    { type: String, default: '' },
  // Access type
  accessType:     { type: String, enum: ['view','download','edit','approve','admin'], default: 'view' },
  // Scope
  scope:          { type: String, enum: ['user','role','department','public'], default: 'user' },
  // Expiry
  expiresAt:      { type: Date },
  isActive:       { type: Boolean, default: true },
  grantedBy:      { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

documentPermissionSchema.index({ document: 1 });
documentPermissionSchema.index({ grantedTo: 1 });
documentPermissionSchema.index({ document: 1, grantedTo: 1 });

documentPermissionSchema.pre('validate', async function (next) {
  if (this.isNew && !this.permissionCode) {
    const yr = new Date().getFullYear();
    const count = await mongoose.model('DocumentPermission').countDocuments();
    this.permissionCode = `DPRM-${yr}-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('DocumentPermission', documentPermissionSchema);
