const { supabase } = require('../config/supabase');

const signup = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(201).json({
            message: 'User registered successfully',
            user: data?.user || null,
            session: data?.session || null,
        });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({
                error: 'Invalid login credentials. If you just signed up, confirm your email in Supabase first.',
                details: error.message,
            });
        }

        return res.status(200).json({
            message: 'Login successful',
            access_token: data?.session?.access_token || null,
            refresh_token: data?.session?.refresh_token || null,
            user: data?.user || null,
        });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access token required for logout' });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Access token required for logout' });
        }

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data?.user) {
            return res.status(401).json({ error: 'Invalid or expired token.' });
        }

        return res.status(200).json({
            message: 'Logged out successfully',
            user: data.user,
        });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
};

module.exports = {
    signup,
    login,
    logout,
};