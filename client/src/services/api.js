class API {
  constructor() {
    this.baseURL = __API__;
  }

  fetch({
    body,
    endpoint,
    headers = {},
    method = 'GET',
  }) {
    const {
      authorization,
      baseURL,
    } = this;
    if (authorization) {
      headers.Authorization = authorization;
    }
    if (body && !(body instanceof FormData)) {
      body = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
    }
    return fetch(
      `${baseURL}${endpoint}`,
      {
        body,
        headers,
        method,
      }
    )
      .then((res) => {
        const { headers, status } = res;
        if (status < 200 || status >= 400) {
          throw new Error(status);
        }
        const type = (headers.get('Content-Type') || '').split(';')[0];
        switch (type) {
          case 'text/plain':
            return res.arrayBuffer();
          case 'application/json':
            return res.json();
          default:
            return res;
        }
      });
  }

  setAuthorization(token) {
    if (token) {
      this.authorization = `Bearer ${token}`;
    } else {
      delete this.authorization;
    }
    this.token = token;
  }
}

export default new API();
