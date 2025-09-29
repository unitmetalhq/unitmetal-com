import {
  GetSwapRouteParams,
  GetSwapRouteResponse,
  PostSwapRouteForEncodedDataParams,
  PostSwapRouteForEncodedDataResponse,
} from "@/lib/buildSwap/types";
import { API_ROUTES, KYBERSWAP_BASE_URL } from "@/lib/buildSwap/constants";

export class KyberSwap {
  private clientId: string;

  constructor(clientId: string = "kyberswap") {
    this.clientId = clientId;
  }

  // Convert params to query string
  private objectToQueryString(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: Record<string, any>
  ): string {
    return Object.entries(obj)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value
            .map(
              (val) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
            )
            .join("&");
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join("&");
  }

  async getSwapRoute(
    params: GetSwapRouteParams
  ): Promise<GetSwapRouteResponse> {
    const queryString = this.objectToQueryString(params);
    const url = `${KYBERSWAP_BASE_URL}${params.chainName}${API_ROUTES.GET_SWAP_ROUTE}?${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        "X-Client-Id": this.clientId,
      },
    });

    return response.json();
  }

  async postSwapRouteForEncodedData(
    params: PostSwapRouteForEncodedDataParams
  ): Promise<PostSwapRouteForEncodedDataResponse> {
    const url = `${KYBERSWAP_BASE_URL}${params.chainName}${API_ROUTES.POST_SWAP_ROUTE_FOR_ENCODED_DATA}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        "X-Client-Id": this.clientId,
      },
      body: JSON.stringify(params),
    });

    return response.json();
  }
}
