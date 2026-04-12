import ky from 'ky';

const apiBase = __API_HTTP__ ? `${__API_HTTP__}/api` : '/api';
const graphqlBase = __API_HTTP__ ? `${__API_HTTP__}/graphql` : '/graphql';

export const client = ky.create({
  prefix: apiBase,
  hooks: {
    init: [
      (options) => {
        const token = sessionStorage.getItem('token');
        if (token) {
          const headers = new Headers(options.headers as HeadersInit);
          headers.set('Authorization', `Bearer ${token}`);
          options.headers = headers;
        }
      },
    ],
  },
});

export const graphqlClient = ky.create({
  prefix: graphqlBase,
  hooks: {
    init: [
      (options) => {
        const token = sessionStorage.getItem('token');
        const headers = new Headers(options.headers as HeadersInit);
        if (token) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        headers.set('Content-Type', 'application/json');
        options.headers = headers;
      },
    ],
  },
});
