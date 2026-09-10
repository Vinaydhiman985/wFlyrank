// Public Info Route
exports.getPublicInfo = (req, res) => {
    return res.status(200).json({
        message: "Welcome stranger! This info is public."
    });
};

// Protected Profile Route (Middleware already verified user)
exports.getProtectedProfile = (req, res) => {
    return res.status(200).json({
        message: "Token verified successfully via middleware",
        user: {
            id: req.user.id,
            email: req.user.email,
            created_at: req.user.created_at
        }
    });
};