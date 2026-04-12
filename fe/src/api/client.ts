import ky from 'ky';

export const client = ky.create({
  prefix: '/api',
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
  prefix: '/graphql',
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
