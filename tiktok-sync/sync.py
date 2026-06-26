#!/usr/bin/env python3
"""
Shopify → TikTok Shop product sync
Pulls products from Shopify and creates/updates them on TikTok Shop.
Prices are passed through exactly as they appear in Shopify.
"""

import hashlib
import hmac
import json
import os
import time
import urllib.parse
import urllib.request
from datetime import datetime

# ── Config (set these as environment variables) ──────────────────────────────
SHOPIFY_STORE       = os.environ.get("SHOPIFY_STORE", "")          # e.g. triiiplestudio.myshopify.com
SHOPIFY_TOKEN       = os.environ.get("SHOPIFY_TOKEN", "")          # Admin API access token
TIKTOK_APP_KEY      = os.environ.get("TIKTOK_APP_KEY", "")
TIKTOK_APP_SECRET   = os.environ.get("TIKTOK_APP_SECRET", "")      # your app secret
TIKTOK_ACCESS_TOKEN = os.environ.get("TIKTOK_ACCESS_TOKEN", "")    # shop-level OAuth token
TIKTOK_SHOP_CIPHER  = os.environ.get("TIKTOK_SHOP_CIPHER", "")     # shop cipher from OAuth response

TIKTOK_BASE_URL     = "https://open-api.tiktokglobalshop.com"
SHOPIFY_API_VERSION = "2024-07"

# ── Shopify helpers ──────────────────────────────────────────────────────────

def shopify_get(path: str) -> dict:
    url = f"https://{SHOPIFY_STORE}/admin/api/{SHOPIFY_API_VERSION}{path}"
    req = urllib.request.Request(url, headers={
        "X-Shopify-Access-Token": SHOPIFY_TOKEN,
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def fetch_shopify_products() -> list:
    """Return all active products with their variants and prices."""
    products = []
    path = "/products.json?status=active&limit=250"
    while path:
        data = shopify_get(path)
        products.extend(data.get("products", []))
        # Pagination via Link header not available through urllib easily —
        # for stores with >250 products use page_info cursor approach below
        path = None  # single page sufficient for most small catalogues
    return products


# ── TikTok Shop helpers ──────────────────────────────────────────────────────

def tiktok_sign(path: str, params: dict, body: str = "") -> str:
    """Generate HMAC-SHA256 signature per TikTok Shop API spec."""
    # Sort params alphabetically, exclude sign and access_token
    exclude = {"sign", "access_token"}
    sorted_params = sorted(
        [(k, v) for k, v in params.items() if k not in exclude]
    )
    param_str = "".join(f"{k}{v}" for k, v in sorted_params)
    base = f"{TIKTOK_APP_SECRET}{path}{param_str}{body}{TIKTOK_APP_SECRET}"
    return hmac.new(
        TIKTOK_APP_SECRET.encode(),
        base.encode(),
        hashlib.sha256,
    ).hexdigest()


def tiktok_request(method: str, path: str, body: dict | None = None) -> dict:
    timestamp = str(int(time.time()))
    params = {
        "app_key":      TIKTOK_APP_KEY,
        "timestamp":    timestamp,
        "shop_cipher":  TIKTOK_SHOP_CIPHER,
        "version":      "202309",
    }
    body_str = json.dumps(body) if body else ""
    params["sign"] = tiktok_sign(path, params, body_str)

    query = urllib.parse.urlencode(params)
    url = f"{TIKTOK_BASE_URL}{path}?{query}"

    headers = {
        "Content-Type":  "application/json",
        "x-tts-access-token": TIKTOK_ACCESS_TOKEN,
    }

    data = body_str.encode() if body_str else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def fetch_tiktok_products() -> dict:
    """Return a dict of {external_product_id: tiktok_product_id}."""
    mapping = {}
    page_token = ""
    while True:
        body = {"page_size": 100}
        if page_token:
            body["page_token"] = page_token
        resp = tiktok_request("POST", "/product/202309/products/search", body)
        for item in resp.get("data", {}).get("products", []):
            # We store Shopify product ID in the external_product_id field
            ext_id = item.get("external_product_id", "")
            if ext_id:
                mapping[ext_id] = item["id"]
        page_token = resp.get("data", {}).get("next_page_token", "")
        if not page_token:
            break
    return mapping


# ── Price helpers ─────────────────────────────────────────────────────────────

def shopify_price_to_tiktok(price_str: str) -> dict:
    """
    Convert Shopify price string (e.g. "39.00") to TikTok price object.
    TikTok expects: {"amount": "3900", "currency": "SGD"}
    Amount is in the smallest currency unit (cents).
    """
    # Shopify stores price in major units with 2 decimal places
    amount_cents = int(round(float(price_str) * 100))
    return {
        "amount":   str(amount_cents),
        "currency": "SGD",
    }


def compare_price_to_tiktok(compare_price_str: str | None) -> dict | None:
    if not compare_price_str or float(compare_price_str) == 0:
        return None
    return shopify_price_to_tiktok(compare_price_str)


# ── Mapping helpers ──────────────────────────────────────────────────────────

def build_tiktok_product_payload(product: dict) -> dict:
    """Transform a Shopify product dict into a TikTok Shop product payload."""
    variants = product.get("variants", [])
    images   = product.get("images", [])

    # Build image list
    tiktok_images = [
        {"uri": img["src"]} for img in images
    ]

    # Build SKUs (one per Shopify variant)
    skus = []
    for variant in variants:
        price     = shopify_price_to_tiktok(variant["price"])
        orig_price = compare_price_to_tiktok(variant.get("compare_at_price"))

        sku: dict = {
            "external_sku_id": str(variant["id"]),
            "seller_sku":      variant.get("sku") or str(variant["id"]),
            "price":           price,
            "inventory": [{
                "warehouse_id": "",   # fill with your TikTok warehouse ID
                "quantity":     variant.get("inventory_quantity", 0),
            }],
        }
        if orig_price:
            sku["original_price"] = orig_price

        # Variant options (size, colour, etc.)
        option_values = []
        for i in range(1, 4):
            opt_val = variant.get(f"option{i}")
            if opt_val and opt_val.lower() not in ("default title", ""):
                option_values.append({"name": opt_val})
        if option_values:
            sku["sales_attributes"] = option_values

        skus.append(sku)

    payload = {
        "external_product_id": str(product["id"]),
        "title":               product["title"],
        "description":         product.get("body_html", ""),
        "skus":                skus,
        "images":              tiktok_images,
        "category_id":         "",   # fill with your TikTok category ID
        "brand_id":            "",   # optional — your brand ID in TikTok
    }

    return payload


# ── Sync logic ───────────────────────────────────────────────────────────────

def sync():
    print(f"[{datetime.now():%Y-%m-%d %H:%M:%S}] Starting Shopify → TikTok Shop sync")

    # Validate config
    missing = [k for k, v in {
        "SHOPIFY_STORE":       SHOPIFY_STORE,
        "SHOPIFY_TOKEN":       SHOPIFY_TOKEN,
        "TIKTOK_APP_KEY":      TIKTOK_APP_KEY,
        "TIKTOK_APP_SECRET":   TIKTOK_APP_SECRET,
        "TIKTOK_ACCESS_TOKEN": TIKTOK_ACCESS_TOKEN,
        "TIKTOK_SHOP_CIPHER":  TIKTOK_SHOP_CIPHER,
    }.items() if not v]
    if missing:
        print(f"ERROR: Missing environment variables: {', '.join(missing)}")
        print("See .env.example for the full list.")
        return

    # 1. Fetch Shopify products
    print("  Fetching Shopify products...")
    shopify_products = fetch_shopify_products()
    print(f"  Found {len(shopify_products)} active Shopify products")

    # 2. Fetch existing TikTok products (to decide create vs update)
    print("  Fetching existing TikTok Shop products...")
    tiktok_existing = fetch_tiktok_products()
    print(f"  Found {len(tiktok_existing)} existing TikTok products")

    created = updated = errors = 0

    for product in shopify_products:
        shopify_id = str(product["id"])
        payload    = build_tiktok_product_payload(product)

        try:
            if shopify_id in tiktok_existing:
                # Update existing product
                tiktok_id = tiktok_existing[shopify_id]
                payload["id"] = tiktok_id
                resp = tiktok_request("PUT", f"/product/202309/products/{tiktok_id}", payload)
                if resp.get("code") == 0:
                    updated += 1
                    print(f"  UPDATED  {product['title']} (TikTok ID {tiktok_id})")
                else:
                    errors += 1
                    print(f"  ERROR    {product['title']}: {resp.get('message')}")
            else:
                # Create new product
                resp = tiktok_request("POST", "/product/202309/products", payload)
                if resp.get("code") == 0:
                    created += 1
                    new_id = resp.get("data", {}).get("product_id", "?")
                    print(f"  CREATED  {product['title']} (TikTok ID {new_id})")
                else:
                    errors += 1
                    print(f"  ERROR    {product['title']}: {resp.get('message')}")
        except Exception as exc:
            errors += 1
            print(f"  EXCEPTION {product['title']}: {exc}")

    print(f"\nDone — created: {created}, updated: {updated}, errors: {errors}")


if __name__ == "__main__":
    sync()
