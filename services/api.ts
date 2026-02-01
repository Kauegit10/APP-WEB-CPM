
import { LoginResponse, ApiResponse, PlayerData } from '../types';

const FIREBASE_KEY = "AIzaSyBW1ZbMiUeDZHYUO2bY8Bfnf5rRgrQGPTM";
const PROXY_URL = "https://corsproxy.io/?";

export class InjecoesDeKing {
  private authToken: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async fetchCpm<T>(url: string, payload: any, headers: Record<string, string> = {}): Promise<T> {
    const finalUrl = `${PROXY_URL}${encodeURIComponent(url)}`;
    
    try {
      const response = await fetch(finalUrl, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(payload)
      });

      return await response.json();
    } catch (error: any) {
      console.error(`[CPM API Error] ${url}:`, error.message);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${FIREBASE_KEY}`;
    const payload = {
      email,
      password,
      returnSecureToken: true,
      clientType: "CLIENT_TYPE_ANDROID"
    };

    const res: any = await this.fetchCpm(url, payload, {
      "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 12; SM-A025F Build/SP1A.210812.016)"
    });

    if (res.idToken) {
      return { ok: true, auth: res.idToken };
    }

    const error = res.error?.message || "UNKNOWN_ERROR";
    return { ok: false, error: 404, message: error };
  }

  async getPlayerData(): Promise<ApiResponse<PlayerData>> {
    if (!this.authToken) throw new Error("Não autenticado");
    const url = "https://us-central1-cp-multiplayer.cloudfunctions.net/GetPlayerRecords2";
    
    const res: any = await this.fetchCpm(url, { data: null }, {
      "Authorization": `Bearer ${this.authToken}`,
      "User-Agent": "okhttp/3.12.13"
    });

    if (res.result) {
      const data = JSON.parse(res.result);
      return { ok: true, data };
    }

    return { ok: false, error: 404 };
  }

  async injectService(service: 'rank'): Promise<ApiResponse<any>> {
    if (!this.authToken) throw new Error("Não autenticado");
    
    if (service === 'rank') {
      const url = "https://us-central1-cp-multiplayer.cloudfunctions.net/SetUserRating4";
      const ratingData = {
        RatingData: {
          time: 10000000000,
          cars: 100000,
          car_fix: 100000,
          car_collided: 100000,
          car_exchange: 100000,
          car_trade: 100000,
          car_wash: 100000,
          slicer_cut: 100000,
          drift_max: 100000,
          drift: 100000,
          cargo: 100000,
          delivery: 100000,
          race_win: 3000,
          taxi: 100000,
          levels: 100000,
          gifts: 100000,
          fuel: 100000,
          offroad: 100000,
          speed_banner: 100000,
          reactions: 100000,
          police: 100000,
          run: 100000,
          real_estate: 100000,
          t_distance: 100000,
          treasure: 100000,
          block_post: 100000,
          push_ups: 100000,
          burnt_tire: 100000,
          passanger_distance: 100000
        }
      };

      const res: any = await this.fetchCpm(url, { data: JSON.stringify(ratingData) }, {
        "Authorization": `Bearer ${this.authToken}`,
        "User-Agent": "okhttp/3.12.13"
      });

      return { ok: !!res.result };
    }

    return { ok: false };
  }
}
