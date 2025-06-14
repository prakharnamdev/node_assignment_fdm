const XLSX = require('xlsx');
const fs = require('fs');
const User = require('../models/user.model');
const { createUserSchema } = require('../validators/user.validator');

exports.uploadUsers = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Excel file is required' });
    }

    try {
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];

        if (!sheetName) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Excel file is empty or corrupted' });
        }

        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!Array.isArray(rawData) || rawData.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Excel sheet is empty' });
        }

        const inserted = [];
        const updated = [];
        const failed = [];

        for (let i = 0; i < rawData.length; i++) {
            const row = rawData[i];

            const userObj = {
                firstName: row.firstName?.toString().trim(),
                lastName: row.lastName?.toString().trim(),
                phoneNumber: row.phoneNumber?.toString().trim(),
                email: row.email?.toString().trim(),
                createdAt: new Date(row.createdAt),
                updatedAt: new Date(row.updatedAt)
            };

            try {
                await createUserSchema.validateAsync(userObj, { abortEarly: false });

                const existingUser = await User.findOne({ email: userObj.email });

                if (existingUser) {
                    const updatedUser = await User.findByIdAndUpdate(existingUser._id, userObj, { new: true });
                    updated.push(updatedUser);
                } else {
                    const newUser = new User(userObj);
                    await newUser.save();
                    inserted.push(newUser);
                }
            } catch (err) {
                failed.push({
                    row: i + 2,
                    errors: err.details?.map(d => d.message) || [err.message]
                });
            }
        }

        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: 'Excel processed successfully',
            insertedCount: inserted.length,
            updatedCount: updated.length,
            failedCount: failed.length,
            failed
        });
    } catch (err) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.status(500).json({
            success: false,
            message: 'Something went wrong, please check error message',
            error: err.message || 'Unexpected error occurred',
        });
    }
};

exports.createUser = async (req, res, next) => {
    try {
        const existing = await User.findOne({ email: req.body.email });
        if (existing) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const user = new User(req.body);
        const data = await user.save();

        if (data) {
            res.status(201).json({ message: 'User created successfully', data: data });
        } else {
            res.status(400).json({ message: 'User not create', data });
        }


    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please check error message',
            error: err.message || 'Unexpected error occurred',
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const filter = {};

        if (search) {
            const regex = new RegExp(search, 'i');
            filter.$or = [
                { firstName: regex },
                { lastName: regex }
            ];
        }

        const users = await User.find(filter)
            .skip((page - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await User.countDocuments(filter);

        res.json({
            success: true,
            message: 'Users fetched successfully',
            total,
            data: users
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please check error message',
            error: err.message || 'Unexpected error occurred',
        });
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User fetched successfully', data: user });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please check error message',
            error: err.message || 'Unexpected error occurred',
        });
    }
};

exports.updateUserById = async (req, res, next) => {
    try {
        const { email } = req.body;
        const userId = req.params.id;

        // Check if email is being updated and is already used by another user
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({
                    message: 'Email already exists with another user'
                });
            }
        }

        const user = await User.findByIdAndUpdate(userId, req.body, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'User updated successfully',
            data: user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please check error message',
            error: err.message || 'Unexpected error occurred',
        });
    }
};

exports.deleteUserById = async (req, res, next) => {
    try {
        const result = await User.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Something went wrong, please check error message',
            error: err.message || 'Unexpected error occurred',
        });
    }
};
