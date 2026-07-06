export class TMDbClient {
    private baseUrl: string = "https://api.themoviedb.org/3";
  
    private async _get(endpoint: string, params: Record<string, string | number> = {}) {
      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        console.error("TMDB API Key missing");
        return {};
      }
      const urlParams = new URLSearchParams({
        api_key: apiKey,
        ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
      });
  
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}?${urlParams.toString()}`);
        if (!response.ok) {
           return {};
        }
        return await response.json();
      } catch (error) {
        console.error(`TMDb Request Error (${endpoint}):`, error);
        return {};
      }
    }
  
    async searchMulti(query: string) {
      const res = await this._get("/search/multi", { query, include_adult: "false", language: "en-US", page: 1 });
      const results = res.results || [];
      if (results.length === 0) return null;
      for (const r of results) {
        if (r.media_type === "movie" || r.media_type === "tv") {
          return r;
        }
      }
      return null;
    }
  
    async searchAutocomplete(query: string, limit: number = 10) {
      const res = await this._get("/search/multi", { query, include_adult: "false", language: "en-US", page: 1 });
      const results = res.results || [];
      const filtered = [];
      for (const r of results) {
        if (r.media_type === "movie" || r.media_type === "tv") {
          filtered.push({
            id: r.id,
            title: r.title || r.name,
            media_type: r.media_type,
            poster_path: r.poster_path,
            year: (r.release_date || r.first_air_date || "").substring(0, 4),
            rating: r.vote_average
          });
        }
        if (filtered.length >= limit) break;
      }
      return filtered;
    }
  
    async getDetails(mediaType: string, id: number) {
      return await this._get(`/${mediaType}/${id}`);
    }
  
    async getSimilar(mediaType: string, id: number) {
      const res = await this._get(`/${mediaType}/${id}/similar`);
      return res.results || [];
    }
  
    async getRecommendations(mediaType: string, id: number) {
      const res = await this._get(`/${mediaType}/${id}/recommendations`);
      return res.results || [];
    }
  
    async getWatchProviders(mediaType: string, id: number) {
      const res = await this._get(`/${mediaType}/${id}/watch/providers`);
      const results = res.results || {};
      
      let countryData = results["US"];
      if (!countryData) {
        const availableCountries = Object.keys(results);
        if (availableCountries.length > 0) {
            countryData = results[availableCountries[0]];
        }
      }
      
      const providers = [];
      if (countryData) {
        for (const key of ["flatrate", "rent", "buy"]) {
          if (countryData[key]) {
            for (const p of countryData[key]) {
              providers.push({
                provider_id: p.provider_id,
                provider_name: p.provider_name,
                logo_path: p.logo_path
              });
            }
          }
        }
      }
      
      // Deduplicate providers by ID
      const uniqueProviders = [];
      const seenIds = new Set();
      for (const p of providers) {
        if (!seenIds.has(p.provider_id)) {
          seenIds.add(p.provider_id);
          uniqueProviders.push(p);
        }
      }
      return uniqueProviders;
    }
  }
  
  export const tmdbClient = new TMDbClient();
