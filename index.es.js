function f(e) {
  return new Worker(
    "/assets/worker-BAxM0uyy.js",
    {
      name: e == null ? void 0 : e.name
    }
  );
}
async function w(e, t) {
  const i = new Array();
  for (const s of e) {
    const o = new Promise(async (a, m) => {
      if (!s.type.startsWith("image/"))
        throw new Error("只支持图片压缩");
      const { fileSizeLimit: c = 30 } = t || {};
      if (s.size <= c << 20) {
        a(s);
        return;
      }
      const r = new f();
      r.onmessage = (n) => {
        a(n.data), r.terminate();
      }, r.onerror = (n) => {
        m(n), r.terminate();
      }, r.postMessage([s, t]);
    });
    i.push(o);
  }
  return Promise.all(i);
}
export {
  w as compress
};
