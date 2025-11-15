import { Schema, model, models, Document } from 'mongoose';

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: ['online', 'offline', 'hybrid'],
      lowercase: true,
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Index for fast slug-based queries
EventSchema.index({ slug: 1 });

/**
 * Pre-save hook to generate slug and normalize date/time
 * - Generates URL-friendly slug from title (only when title changes)
 * - Validates and normalizes date to ISO format
 * - Ensures time is stored in consistent HH:MM format
 */
EventSchema.pre('save', function (next) {
  // Generate slug only if title is new or modified
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Validate and normalize date to ISO format (YYYY-MM-DD)
  if (this.isModified('date')) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(this.date)) {
      // Try to parse and convert to ISO format
      const parsedDate = new Date(this.date);
      if (isNaN(parsedDate.getTime())) {
        return next(new Error('Invalid date format. Expected YYYY-MM-DD or a valid date string'));
      }
      this.date = parsedDate.toISOString().split('T')[0];
    }
  }

  // Validate and normalize time to HH:MM format
  if (this.isModified('time')) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(this.time)) {
      return next(new Error('Invalid time format. Expected HH:MM (24-hour format)'));
    }
    // Ensure zero-padding for consistency
    const [hours, minutes] = this.time.split(':');
    this.time = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  next();
});

// Prevent model recompilation in Next.js development
const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
