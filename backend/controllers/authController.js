import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cloudinary, uploadBufferToCloudinary } from '../config/cloudinary.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ── Auth ─────────────────────────────────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, expertise, portfolio, bio, interests, categories } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name, email, password: hashedPassword, role,
      expertise, portfolio, bio, interests, categories: categories || []
    });

    if (user) {
      res.status(201).json({
        _id: user.id, name: user.name, email: user.email,
        role: user.role, token: generateToken(user._id, user.role),
        categories: user.categories || [],
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    let errorMsg = error.message;
    if (error.message && (error.message.includes('SSL') || error.message.includes('tlsv1') || error.message.includes('buffering timed out') || error.message.includes('Could not connect'))) {
      errorMsg = 'Database connection error: Please make sure your IP is whitelisted in MongoDB Atlas Network Access.';
    }
    res.status(500).json({ message: errorMsg });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id, name: user.name, email: user.email,
        role: user.role, token: generateToken(user._id, user.role),
        profilePhoto: user.profilePhoto,
        categories: user.categories || [],
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    let errorMsg = error.message;
    if (error.message && (error.message.includes('SSL') || error.message.includes('tlsv1') || error.message.includes('buffering timed out') || error.message.includes('Could not connect'))) {
      errorMsg = 'Database connection error: Please make sure your IP is whitelisted in MongoDB Atlas Network Access.';
    }
    res.status(500).json({ message: errorMsg });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Update Profile ────────────────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const allowed = ['name', 'bio', 'expertise', 'portfolio', 'interests',
                     'phone', 'website', 'twitter', 'instagram', 'youtube', 'categories'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    // Profile photo upload
    if (req.file && req.file.buffer) {
      try {
        if (user.profilePhotoPublicId) {
          await cloudinary.uploader.destroy(user.profilePhotoPublicId);
        }
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, { folder: 'castncart/profiles' });
        user.profilePhoto = uploadResult.secure_url;
        user.profilePhotoPublicId = uploadResult.public_id;
      } catch (err) {
        console.warn("Failed to upload photo to Cloudinary:", err.message);
      }
    }

    await user.save();
    const updated = await User.findById(user._id).select('-password');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: 'Categories must be an array' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.categories = categories.map(c => typeof c === 'string' ? c.trim() : c).filter(Boolean);
    await user.save();

    const updated = await User.findById(user._id).select('-password');
    res.json({ message: 'Categories updated successfully', categories: updated.categories, user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Change Email ──────────────────────────────────────────────────────────────
export const changeEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    if (!newEmail || !password) return res.status(400).json({ message: 'Email and current password required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect current password' });

    const exists = await User.findOne({ email: newEmail });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    user.email = newEmail;
    await user.save();
    // Issue a fresh token with updated data
    const token = generateToken(user._id, user.role);
    res.json({ message: 'Email updated', email: user.email, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Change Password ───────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect current password' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Delete Account ────────────────────────────────────────────────────────────
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    if (user.profilePhotoPublicId) {
      await cloudinary.uploader.destroy(user.profilePhotoPublicId);
    }
    await user.deleteOne();
    res.json({ message: 'Account deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
