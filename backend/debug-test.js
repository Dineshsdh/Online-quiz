import fs from 'fs';

const log = (msg) => {
    fs.appendFileSync('debug.log', msg + '\n');
};

log('Starting import test at ' + new Date().toISOString());

try {
    log('1. Testing express...');
    const express = await import('express');
    log('   ✓ express loaded');

    log('2. Testing cors...');
    const cors = await import('cors');
    log('   ✓ cors loaded');

    log('3. Testing dotenv...');
    const dotenv = await import('dotenv');
    dotenv.default.config();
    log('   ✓ dotenv loaded');
    log('   MONGODB_URI: ' + (process.env.MONGODB_URI ? 'SET' : 'MISSING'));

    log('4. Testing mongoose...');
    const mongoose = await import('mongoose');
    log('   ✓ mongoose loaded');

    log('5. Testing db.js...');
    const db = await import('./config/db.js');
    log('   ✓ db.js loaded');

    log('6. Testing errorHandler.js...');
    const errorHandler = await import('./middleware/errorHandler.js');
    log('   ✓ errorHandler.js loaded');

    log('7. Testing User.js...');
    const User = await import('./models/User.js');
    log('   ✓ User.js loaded');

    log('8. Testing authController.js...');
    const authController = await import('./controllers/authController.js');
    log('   ✓ authController.js loaded');

    log('9. Testing authRoutes.js...');
    const authRoutes = await import('./routes/authRoutes.js');
    log('   ✓ authRoutes.js loaded');

    log('10. Testing contestController.js...');
    const contestController = await import('./controllers/contestController.js');
    log('   ✓ contestController.js loaded');

    log('\n✓ ALL IMPORTS SUCCESSFUL!');

} catch (error) {
    log('\n✗ IMPORT FAILED: ' + error.message);
    log('Stack: ' + error.stack);
}
