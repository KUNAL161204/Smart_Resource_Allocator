const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password_hash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'volunteer'],
      required: true,
      index: true,
    },

    // Volunteer-specific profile fields
    address: { type: String, trim: true },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    phone: { type: String, trim: true },
    domain_knowledge: {
      type: String,
      enum: [
        'Medical',
        'Logistics',
        'Rescue',
        'Education',
        'Water & Sanitation',
        'Shelter',
        'Food Security',
        'Communications',
        'Other',
      ],
    },

    // Soft-link to the operational Volunteer profile (for field matching)
    volunteer_profile_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
      default: null,
    },

    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('User', userSchema);
