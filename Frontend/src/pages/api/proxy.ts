// Next.js API route to proxy requests to the backend with authentication
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get the backend API URL from environment variables
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8000';

    // Extract the path after /api/proxy
    const { path } = req.query;
    const proxyPath = Array.isArray(path) ? path.join('/') : path || '';

    // Construct the target URL
    const targetUrl = `${backendUrl}/${proxyPath}`;

    // Get the authorization token from the request headers
    const authHeader = req.headers.authorization;

    // Prepare headers for the backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if present
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    // Make the request to the backend
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers,
      data: req.body,
      params: req.query,
    });

    // Return the response from the backend
    res.status(response.status).json(response.data);
  } catch (error: any) {
    // Handle errors from the backend
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'Internal server error' };

    res.status(status).json(data);
  }
}