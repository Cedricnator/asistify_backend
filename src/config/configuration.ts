export default () => ({
    env: {
        port: parseInt(process.env.PORT ?? '3000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
    },
    supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        authJwtSecret: process.env.SUPABASE_AUTH_JWT_SECRET,
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-live-001', // Live API model with tool calling
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '1.0'),
        maxOutputTokens: parseInt(
            process.env.GEMINI_MAX_OUTPUT_TOKENS || '8192',
            10,
        ),
        topP: parseFloat(process.env.GEMINI_TOP_P || '0.95'),
        topK: parseInt(process.env.GEMINI_TOP_K || '40', 10),
    },
});
