function buildRequestUrl(baseUrl, query) {
  const url = new URL(baseUrl, window.location.origin);

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        url.searchParams.append(key, item);
      });
      return;
    }

    if (typeof value === "boolean") {
      url.searchParams.set(key, value ? "1" : "0");
      return;
    }

    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export class RentCalculatorHttpApi {
  constructor(url) {
    this.url = url;
  }

  async fetchState(query = {}) {
    const url = buildRequestUrl(this.url, query);
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Rent calculator API error: ${response.status}`);
    }

    return response.json();
  }
}
