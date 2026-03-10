// Test imports step by step
console.log('Starting import test...');

try {
    console.log('1. Testing express...');
    const express = await import('express');
    console.log('   ✓ express loaded');

    console.log('2. Testing cors...');
    const cors = await import('cors');
    console.log('   ✓ cors loaded');

    console.log('3. Testing dotenv...');
    const dotenv = await import('dotenv');
    dotenv.default.config();
    console.log('   ✓ dotenv loaded and configured');
    console.log('   MONGODB_URI exists:', !!process.env.MONGODB_URI);

    console.log('4. Testing mongoose...');
    const mongoose = await import('mongoose');
    console.log('   ✓ mongoose loaded');

    console.log('5. Testing config/db.js...');
    const db = await import('./config/db.js');
    console.log('   ✓ db.js loaded');

    console.log('6. Testing middleware/errorHandler.js...');
    const errorHandler = await import('./middleware/errorHandler.js');
    console.log('   ✓ errorHandler.js loaded');

    console.log('7. Testing models/User.js...');
    const User = await import('./models/User.js');
    console.log('   ✓ User.js loaded');

    console.log('8. Testing controllers/authController.js...');
    const authController = await import('./controllers/authController.js');
    console.log('   ✓ authController.js loaded');

    console.log('9. Testing routes/authRoutes.js...');
    const authRoutes = await import('./routes/authRoutes.js');
    console.log('   ✓ authRoutes.js loaded');

    console.log('10. Testing controllers/contestController.js...');
    const contestController = await import('./controllers/contestController.js');
    console.log('   ✓ contestController.js loaded');

    console.log('11. Testing routes/contestRoutes.js...');
    const contestRoutes = await import('./routes/contestRoutes.js');
    console.log('   ✓ contestRoutes.js loaded');

    console.log('12. Testing controllers/questionController.js...');
    const questionController = await import('./controllers/questionController.js');
    console.log('   ✓ questionController.js loaded');

    console.log('13. Testing routes/questionRoutes.js...');
    const questionRoutes = await import('./routes/questionRoutes.js');
    console.log('   ✓ questionRoutes.js loaded');

    console.log('14. Testing controllers/submissionController.js...');
    const submissionController = await import('./controllers/submissionController.js');
    console.log('   ✓ submissionController.js loaded');

    console.log('15. Testing routes/submissionRoutes.js...');
    const submissionRoutes = await import('./routes/submissionRoutes.js');
    console.log('   ✓ submissionRoutes.js loaded');

    console.log('\n✓ ALL IMPORTS SUCCESSFUL!');

} catch (error) {
    console.error('\n✗ IMPORT FAILED:', error.message);
    console.error('Stack:', error.stack);
}
