import { useEffect } from "react";

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setJsonLd(id, data) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id) {
  document.getElementById(id)?.remove();
}

export default function useSeo({ title, description, keywords, image, url, type, jsonLd }) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }
    if (keywords) {
      setMeta("name", "keywords", Array.isArray(keywords) ? keywords.join(", ") : keywords);
    }
    if (title) {
      setMeta("property", "og:title", title);
      setMeta("name", "twitter:title", title);
    }
    if (image) {
      setMeta("property", "og:image", image);
      setMeta("name", "twitter:image", image);
    }
    if (url) {
      setMeta("property", "og:url", url);
    }
    if (type) {
      setMeta("property", "og:type", type);
    }
    if (jsonLd) {
      setJsonLd("page-jsonld", jsonLd);
    }

    return () => {
      if (jsonLd) removeJsonLd("page-jsonld");
    };
  }, [title, description, keywords, image, url, type, jsonLd]);
}