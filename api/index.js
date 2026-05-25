// Vercel serverless function entry point.
// This is a placeholder file tracked by Git so Vercel registers this function.
// During build, it is dynamically overwritten with the fully bundled API server.

export default function handler(req, res) {
  res.status(200).json({ message: "Serverless function building..." });
}
