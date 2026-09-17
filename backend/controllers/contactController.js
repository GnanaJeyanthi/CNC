import ContactMessage from '../models/ContactMessage.js';

// Create a new contact inquiry
export const submitContactForm = async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please provide full name, email, subject, and message.' });
    }

    const contactDoc = await ContactMessage.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Your message has been received.',
      data: contactDoc,
    });
  } catch (error) {
    console.error('Submit Contact Form Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to submit contact message' });
  }
};

// Get all contact messages (Admin/Support view)
export const getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
