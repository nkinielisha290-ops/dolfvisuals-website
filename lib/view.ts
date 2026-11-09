import { categoryLabel, tr } from "./i18n";
import type { Lang, PortfolioItem } from "./types";
import type { GalleryItem } from "@/components/Gallery";

export function toGallery(items: PortfolioItem[], lang: Lang): GalleryItem[] {
  return items.map((i) => ({
    id: i.id,
    src: i.image_url,
    w: i.width ?? 1200,
    h: i.height ?? 1500,
    title: tr(i, "title", lang),
    category: i.category,
    categoryLabel: categoryLabel(i.category, lang),
    videoUrl: i.media_type === "video" ? i.video_url : null,
  }));
}
