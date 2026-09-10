const { supabase } = require('../config/supabase');

const requireAuth = async (req, res, next) => {
    try {
        console.log("1. Middleware hit!");
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log("Error: No auth header");
            return res.status(401).json({ error: "Access token required" });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            console.log("Error: No token found");
            return res.status(401).json({ error: "Access token required" });
        }

        console.log("2. Verifying token with Supabase...");
        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.log("Error from Supabase:", error?.message);
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        console.log("3. Token verified successfully for user:", user.email);
        req.user = user;
        next();
    } catch (err) {
        console.log("Catch block error:", err.message);
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

module.exports = requireAuth;