export default function handler(req, res) {
  const apiKey = process.env.REACT_APP_API_KEY;
  res.status(200).json({ apiKey });
}
