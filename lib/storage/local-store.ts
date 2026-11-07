import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { Artwork } from "@/types/art";

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_ARTWORKS_FILE = path.join(DATA_DIR, "local-artworks.json");

// In-memory cache fallback for serverless or fast access
const memoryCache: Artwork[] = [];

/**
 * Reads local artworks from disk or in-memory fallback.
 */
export async function readLocalArtworksFile(): Promise<Artwork[]> {
  try {
    const raw = await readFile(LOCAL_ARTWORKS_FILE, "utf-8");
    if (!raw.trim()) return memoryCache;
    const list = JSON.parse(raw);
    return Array.isArray(list) ? (list as Artwork[]) : memoryCache;
  } catch {
    return memoryCache;
  }
}

/**
 * Persists an artwork to local-artworks.json on disk without any 4KB cookie limits.
 */
export async function writeLocalArtworkFile(artwork: Artwork): Promise<Artwork[]> {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const current = await readLocalArtworksFile();
    const updated = [artwork, ...current.filter((a) => a.id !== artwork.id)].slice(0, 100);

    // Update in-memory cache
    memoryCache.length = 0;
    memoryCache.push(...updated);

    await writeFile(LOCAL_ARTWORKS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch (err) {
    console.warn("[ARTIQ] Could not write to local-artworks.json, updating in-memory cache only:", err);
    const updated = [artwork, ...memoryCache.filter((a) => a.id !== artwork.id)];
    memoryCache.length = 0;
    memoryCache.push(...updated);
    return updated;
  }
}

/**
 * Removes an artwork from local-artworks.json
 */
export async function removeLocalArtworkFile(artworkId: string): Promise<Artwork[]> {
  try {
    const current = await readLocalArtworksFile();
    const updated = current.filter((a) => a.id !== artworkId);

    memoryCache.length = 0;
    memoryCache.push(...updated);

    await writeFile(LOCAL_ARTWORKS_FILE, JSON.stringify(updated, null, 2), "utf-8");
    return updated;
  } catch {
    const updated = memoryCache.filter((a) => a.id !== artworkId);
    memoryCache.length = 0;
    memoryCache.push(...updated);
    return updated;
  }
}

