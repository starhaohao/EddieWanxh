const SALE_HERO_QUERY = `#graphql
  query SaleHero($handle: String!) {
    metaobject(handle: {handle: $handle, type: "sale_hero"}) {
      fields {
        key
        value
        reference {
          ... on MediaImage {
            image {
              url
              altText
            }
          }
        }
        references(first: 10) {
          nodes {
            ... on Metaobject {
              fields {
                key
                value
              }
            }
          }
        }
      }
    }
  }
`;

/** Minimal serializer for Shopify's rich_text_field JSON schema (paragraphs + bold text runs). */
function richTextToHtml(json) {
  if (!json) return '';
  let root;
  try {
    root = JSON.parse(json);
  } catch {
    return '';
  }
  const renderChildren = (children = []) =>
    children
      .map((node) => {
        if (node.type === 'text') {
          const value = node.value ?? '';
          return node.bold ? `<strong>${value}</strong>` : value;
        }
        return '';
      })
      .join('');
  return (root.children ?? [])
    .map((paragraph) => renderChildren(paragraph.children))
    .join('<br/>');
}

function fieldMap(fields) {
  return Object.fromEntries(fields.map((f) => [f.key, f]));
}

/**
 * Fetches the "home" sale_hero metaobject and shapes it into SaleHero props.
 * Returns null if the metaobject hasn't been created yet (see
 * metaobjects/sale-hero.admin-mutations.graphql) so callers can fall back
 * to static defaults.
 */
export async function getSaleHero(storefront, handle = 'home') {
  const {metaobject} = await storefront.query(SALE_HERO_QUERY, {
    variables: {handle},
  });
  if (!metaobject) return null;

  const fields = fieldMap(metaobject.fields);

  return {
    image: fields.image?.reference?.image ?? null,
    heroHeight: fields.hero_height ? Number(fields.hero_height.value) : undefined,
    overlayFrom: fields.overlay_from?.value,
    overlayTo: fields.overlay_to?.value,
    eyebrow: fields.eyebrow?.value,
    eyebrowColor: fields.eyebrow_color?.value,
    title: richTextToHtml(fields.title?.value),
    titleSize: fields.title_size ? Number(fields.title_size.value) : undefined,
    subtitle: richTextToHtml(fields.subtitle?.value),
    ctaText: fields.cta_text?.value,
    ctaUrl: fields.cta_url?.value,
    ctaBg: fields.cta_bg?.value,
    ctaTextColor: fields.cta_text_color?.value,
    showUrgency: fields.show_urgency?.value === 'true',
    urgencyLabel: fields.urgency_label?.value,
    urgencyText: richTextToHtml(fields.urgency_text?.value),
    ghostCtas: (fields.ghost_ctas?.references?.nodes ?? []).map((node) => {
      const ctaFields = fieldMap(node.fields);
      return {label: ctaFields.label?.value, url: ctaFields.url?.value};
    }),
  };
}
