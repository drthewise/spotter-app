/**
 * Spotter Local Backend & Cloudflare R2 API Service
 * Connects to your local machine IP (http://192.168.50.43:8080)
 */

export const API_BASE_URL = 'http://192.168.50.43:8080';

export interface PresignedUploadResponse {
  uploadUrl: string;
  publicCdnUrl: string;
  isLocal: boolean;
  storageType: 'cloudflare_r2' | 'local_disk';
}

export const ApiService = {
  /**
   * Health Check
   */
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
      return res.ok;
    } catch (e) {
      console.log('Local Spotter backend offline or unreachable.');
      return false;
    }
  },

  /**
   * Fetch current user profile
   */
  async getMe() {
    const res = await fetch(`${API_BASE_URL}/api/me`);
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  /**
   * Update profile & fitness DNA
   */
  async updateMe(updates: Record<string, any>) {
    const res = await fetch(`${API_BASE_URL}/api/me`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  /**
   * Fetch discovery lifters
   */
  async getDiscoveryProfiles() {
    const res = await fetch(`${API_BASE_URL}/api/discovery`);
    if (!res.ok) throw new Error('Failed to fetch discovery profiles');
    return res.json();
  },

  /**
   * Fetch matches and chat sessions
   */
  async getMatches() {
    const res = await fetch(`${API_BASE_URL}/api/matches`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  /**
   * Send chat message
   */
  async sendMessage(matchId: string, senderId: string, text: string) {
    const res = await fetch(`${API_BASE_URL}/api/matches/${matchId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, text }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  /**
   * Fetch gym beacons
   */
  async getBeacons() {
    const res = await fetch(`${API_BASE_URL}/api/beacons`);
    if (!res.ok) throw new Error('Failed to fetch beacons');
    return res.json();
  },

  /**
   * Request Cloudflare R2 Presigned Upload URL
   */
  async getPresignedUploadUrl(filename: string, contentType = 'image/jpeg'): Promise<PresignedUploadResponse> {
    const res = await fetch(`${API_BASE_URL}/api/storage/presign?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to get presigned upload URL');
    return res.json();
  },

  /**
   * Direct Upload to Cloudflare R2 (or Local Server Fallback)
   */
  async uploadImage(uri: string, filename = 'fit_check.jpg'): Promise<string> {
    const presign = await this.getPresignedUploadUrl(filename, 'image/jpeg');

    // Fetch binary blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Upload directly to Cloudflare R2 (or local server)
    const uploadRes = await fetch(presign.uploadUrl, {
      method: presign.isLocal ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: blob,
    });

    if (!uploadRes.ok) {
      throw new Error('Failed to upload image binary to storage');
    }

    console.log('Successfully uploaded photo to:', presign.publicCdnUrl);
    return presign.publicCdnUrl;
  },
};
