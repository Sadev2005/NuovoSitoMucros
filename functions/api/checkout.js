// Cloudflare Pages Function: POST /api/checkout
// Creates a Stripe Checkout Session and a pending order row in D1.
// Talks to Stripe via plain fetch (the `stripe` npm SDK is not Workers-compatible).

function generateOrderNumber() {
  return `UC-${Math.floor(100000 + Math.random() * 900000)}`;
}

function toFormBody(params, prefix = "") {
  const pairs = [];
  for (const [key, value] of Object.entries(params)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((item, i) => {
        if (typeof item === "object") {
          pairs.push(toFormBody(item, `${fullKey}[${i}]`));
        } else {
          pairs.push(`${encodeURIComponent(`${fullKey}[${i}]`)}=${encodeURIComponent(item)}`);
        }
      });
    } else if (typeof value === "object" && value !== null) {
      pairs.push(toFormBody(value, fullKey));
    } else if (value !== undefined && value !== null) {
      pairs.push(`${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`);
    }
  }
  return pairs.join("&");
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "Stripe non configurato lato server." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return new Response(JSON.stringify({ error: "Carrello vuoto." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingCost = subtotal >= 40 ? 0 : 4.9;
  const orderNumber = generateOrderNumber();
  const origin = new URL(request.url).origin;

  const lineItems = items.map((item, i) => ({
    quantity: item.qty,
    price_data: {
      currency: "eur",
      unit_amount: Math.round(item.price * 100),
      product_data: { name: item.name },
    },
  }));

  const totalAmountInCents = Math.round((subtotal + shippingCost) * 100);

  const params = {
    mode: "payment",
    "line_items": lineItems,
    success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}&amount=${totalAmountInCents}`,
    cancel_url: `${origin}/checkout`,
    shipping_address_collection: { allowed_countries: ["IT"] },
    phone_number_collection: { enabled: true },
    metadata: { order_number: orderNumber },
  };

  if (shippingCost > 0) {
    params.shipping_options = [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: Math.round(shippingCost * 100), currency: "eur" },
          display_name: "Spedizione standard",
        },
      },
    ];
  }

  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: toFormBody(params),
  });

  const session = await stripeRes.json();

  if (!stripeRes.ok) {
    return new Response(JSON.stringify({ error: session.error?.message ?? "Errore Stripe" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (env.DB) {
    await env.DB.prepare(
      `INSERT INTO orders (order_number, stripe_session_id, items_json, subtotal, shipping_cost, total, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`
    )
      .bind(
        orderNumber,
        session.id,
        JSON.stringify(items),
        subtotal,
        shippingCost,
        subtotal + shippingCost
      )
      .run();
  }

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json" },
  });
}
