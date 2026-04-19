const path = require('path');
const fs = require('fs');

const envProdPath = path.resolve(__dirname, '.env.production');

function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return false;
    const text = fs.readFileSync(filePath, 'utf8');
    for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
        ) {
            val = val.slice(1, -1);
        }
        if (process.env[key] === undefined) process.env[key] = val;
    }
    return true;
}

if (loadEnvFile(envProdPath)) {
    console.log('✅ Loaded .env.production file');
} else {
    console.warn('⚠️  .env.production file not found at:', envProdPath);
}

module.exports = {
    apps: [
        {
            name: 'yaaro-business-admin',
            script: 'npm',
            args: 'start',
            cwd: __dirname,
            exec_mode: 'fork',
            instances: 1,
            watch: false,
            max_memory_restart: '1G',
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            env: {
                NODE_ENV: 'production',
                PORT: process.env.PORT || 3001,
                NEXT_PUBLIC_API_URL:
                    process.env.NEXT_PUBLIC_API_URL ||
                    'http://72.60.202.59:3100/api',
                NEXT_PUBLIC_IMAGE_URL:
                    process.env.NEXT_PUBLIC_IMAGE_URL ||
                    'http://72.60.202.59:3100',
            },
            env_development: {
                NODE_ENV: 'development',
                PORT: process.env.PORT || 3001,
            },
            autorestart: true,
            restart_delay: 4000,
            max_restarts: 10,
            min_uptime: '10s',
        },
    ],
};
