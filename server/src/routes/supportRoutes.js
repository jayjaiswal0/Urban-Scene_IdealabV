import express from 'express';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

const faqs = [
  {
    id: 1,
    question: 'How quickly will a reported road crater or pothole be inspected?',
    answer:
      'High-priority urgent hazards are triaged within 2 hours. Routine potholes are inspected by Ward Public Works within 24 hours of submission.',
  },
  {
    id: 2,
    question: 'How do I track the progress of my civic complaint?',
    answer:
      'Navigate to "My Reports" from your Citizen Dashboard to review real-time status progressions, supervisor notes, and photo verifications.',
  },
  {
    id: 3,
    question: 'What is the Green Corridor directive for emergency services?',
    answer:
      'The Green Corridor directive synchronizes arterial traffic signals to continuous green waves for critical emergency vehicles heading to tertiary trauma centers.',
  },
  {
    id: 4,
    question: 'How are parking space counts updated?',
    answer:
      'Municipal parking facilities utilize automated inductive loop sensors and FastTag gate readers, synced with our sensor hub every 30 seconds.',
  },
];

// List FAQs
router.get('/faqs', (req, res) => {
  res.json({
    success: true,
    data: faqs,
  });
});

// Submit Support Inquiry
router.post('/inquiries', optionalAuth, (req, res) => {
  const { fullName, email, ward, category, priority, description } = req.body;

  if (!fullName || !email || !description) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_FIELDS', message: 'Name, email, and description are required' },
    });
  }

  const ticketId = `SUP-MMR-${Date.now().toString().slice(-6)}`;

  res.status(201).json({
    success: true,
    message: 'Support inquiry logged with Ward Nodal Helpdesk',
    data: {
      ticketId,
      fullName,
      email,
      ward: ward || 14,
      category: category || 'GENERAL_INQUIRY',
      createdAt: new Date(),
    },
  });
});

export default router;
