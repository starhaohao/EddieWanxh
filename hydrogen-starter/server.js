// @ts-ignore
import * as remixBuild from 'virtual:remix/server-build';

export default {
  async fetch(request, env, executionContext) {
    return new Response('<html><body>ok</body></html>', {
      headers: {'Content-Type': 'text/html'},
      status: 200,
    });
  },
};
