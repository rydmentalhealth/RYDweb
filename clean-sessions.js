// Clean-sessions.js - Run with: node clean-sessions.js
const { PrismaClient } = require('./lib/generated/prisma');

async function cleanSessions() {
  console.log("Starting session cleanup...");
  
  const prisma = new PrismaClient();
  
  try {
    // Delete all sessions
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`Deleted ${deletedSessions.count} sessions`);
    
    // Delete all verification tokens
    const deletedTokens = await prisma.verificationToken.deleteMany({});
    console.log(`Deleted ${deletedTokens.count} verification tokens`);
    
    console.log("Session cleanup completed successfully");
  } catch (error) {
    console.error("Error cleaning sessions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanSessions()
  .then(() => console.log("Done."))
  .catch(error => console.error("Fatal error:", error)); 