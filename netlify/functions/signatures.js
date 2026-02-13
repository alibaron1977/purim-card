// netlify/functions/signatures.js
const { getStore } = require("@netlify/blobs");

exports.handler = async () => {
  try {
    const store = getStore("purim-signatures");
    const data = await store.get("signatures", { type: "json" });
    const signatures = (data && Array.isArray(data.signatures)) ? data.signatures : [];
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "access-control-allow-origin": "*"
      },
      body: JSON.stringify({ signatures })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        "access-control-allow-origin": "*"
      },
      body: JSON.stringify({ signatures: [] })
    };
  }
};
