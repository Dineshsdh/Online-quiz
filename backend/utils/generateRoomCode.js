/**
 * Generate a unique 6-character room code
 * Uses uppercase letters and numbers (excluding confusing chars like 0, O, 1, I, L)
 */
const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

export default generateRoomCode;
