// src/components/PublicationsCarousel.js
import { useEffect, useMemo, useState } from "react";
import Slider from "react-slick";
import "./PublicationsCarousel.css";

// Slick CSS (required)
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/**
 * Props:
 * - publications?: Array<{ title, year?, venue?, scholar_url?, highlight?, citations? }>
 *
 * If `publications` is not passed, this component will try to load
 * /data/scholar.json (the shape planned for your future automation).
 */
export default function PublicationsCarousel({ publications }) {
  const [fetched, setFetched] = useState(null);

  useEffect(() => {
    if (publications && publications.length) return;
    // Fallback fetch (works with GitHub Pages if you later add public/data/scholar.json)
    const url = (process.env.PUBLIC_URL || "") + "/data/scholar.json";
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setFetched(json?.publications || []))
      .catch(() => setFetched([]));
  }, [publications]);

  const items = useMemo(() => {
    const arr = (publications && publications.length ? publications : fetched) || [];
    // Prefer newest
    return [...arr].sort((a, b) => (b?.year ?? 0) - (a?.year ?? 0)).slice(0, 7);
  }, [publications, fetched]);

  if (!items?.length) {
    return null; // nothing to show
  }

  const settings = {
    autoplay: true,
    autoplaySpeed: 3500,
    infinite: true,
    dots: true,
    arrows: false,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    pauseOnHover: true,
    adaptiveHeight: true,
    responsive: [
      { breakpoint: 1024, settings: { dots: true } },
      { breakpoint: 768, settings: { dots: false } }
    ],
  };

  return (
    <section className="pubs-hero">
      <div className="pubs-strip">Recent Publications & Highlights</div>
      <Slider {...settings}>
        {items.map((p, i) => {
          const body = (
            <div className="pubs-slide" key={i}>
              <h2 className="pubs-title">{p.title}</h2>
              <p className="pubs-meta">
                {p.venue ? <span>{p.venue}</span> : null}
                {p.venue && (p.year || p.citations != null) ? <span> · </span> : null}
                {p.year ? <span>{p.year}</span> : null}
                {p.year && p.citations != null ? <span> · </span> : null}
                {p.citations != null ? <span>Citations: {p.citations}</span> : null}
              </p>
              {p.highlight ? <p className="pubs-highlight">{p.highlight}</p> : null}
            </div>
          );
          return p.scholar_url ? (
            <a
              href={p.scholar_url}
              target="_blank"
              rel="noreferrer"
              className="pubs-link-wrapper"
              key={i}
              aria-label={`Open on Google Scholar: ${p.title}`}
            >
              {body}
            </a>
          ) : (
            body
          );
        })}
      </Slider>
    </section>
  );
}
