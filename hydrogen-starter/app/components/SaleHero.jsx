export default function SaleHero({
  image,
  heroHeight = 92,
  overlayFrom = 'rgba(10,10,10,0.75)',
  overlayTo = 'rgba(10,10,10,0.32)',
  eyebrow,
  eyebrowColor = '#923531',
  title,
  titleSize = 84,
  subtitle,
  ctaText,
  ctaUrl,
  ctaBg = '#923531',
  ctaTextColor = '#ffffff',
  showUrgency = true,
  urgencyLabel,
  urgencyText,
  ghostCtas = [],
}) {
  return (
    <section
      className="sh"
      style={{
        '--sh-h': `${heroHeight}vh`,
        '--sh-ov1': overlayFrom,
        '--sh-ov2': overlayTo,
        '--sh-eye': eyebrowColor,
        '--sh-ts': `${titleSize}px`,
      }}
    >
      {image ? (
        <img className="sh__img" src={image.url} alt={image.altText ?? ''} loading="eager" />
      ) : (
        <div className="sh__img sh__img--placeholder" />
      )}
      <div className="sh__overlay" />

      {showUrgency && (
        <div className="sh__urgency">
          <div className="sh__urgency-label">{urgencyLabel}</div>
          <div
            className="sh__urgency-tag"
            dangerouslySetInnerHTML={{__html: urgencyText}}
          />
        </div>
      )}

      <div className="sh__content">
        {eyebrow && <div className="sh__eyebrow">{eyebrow}</div>}
        <h1 className="sh__title" dangerouslySetInnerHTML={{__html: title}} />
        {subtitle && (
          <div className="sh__sub" dangerouslySetInnerHTML={{__html: subtitle}} />
        )}
        <div className="sh__ctas">
          {ctaText && (
            <a
              className="sh__cta"
              href={ctaUrl}
              style={{background: ctaBg, color: ctaTextColor}}
            >
              {ctaText} →
            </a>
          )}
          {ghostCtas.map((cta, i) => (
            <a key={i} className="sh__cta-ghost" href={cta.url}>
              {cta.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
