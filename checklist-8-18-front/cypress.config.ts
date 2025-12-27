import { defineConfig } from 'cypress';
import jwt from 'jsonwebtoken'; 
export default defineConfig({
  e2e: {
    // Aumentamos o timeout padrão de todos os comandos de 4s para 10s.
    defaultCommandTimeout: 10000,

    setupNodeEvents(on, _config) {
      on('task', {
        generateJwt: (payload) => {
          const token = jwt.sign(payload, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpzaWx2YSIsInN1YiI6MSwicm9sZXMiOlsiSU5TUEVDVE9SIl0sImlhdCI6MTc1ODMxNzIxMSwiZXhwIjoxNzU4MzIwODExfQ.mwXz62pOzNzzNcniRwilw6iTJm7JSAFYVBWWK0AbDmM', { 
            expiresIn: '1h',
          });
          return token;
        },
      });
    },
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
  },
});