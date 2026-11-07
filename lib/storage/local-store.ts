import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { Artwork, Artist } from "@/types/art";

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_ARTWORKS_FILE = path.join(DATA_DIR, "local-artworks.json");
const DELETED_ARTWORKS_FILE = path.join(DATA_DIR, "deleted-artworks.json");
const ARTWORK_OVERRIDES_FILE = path.join(DATA_DIR, "artwork-overrides.json");
const DELETED_PROFILES_FILE = path.join(DATA_DIR, "deleted-profiles.json");
const PROFILE_OVERRIDES_FILE = path.join(DATA_DIR, "profile-overrides.json");

// In-memory caches fallback for serverless or fast access
const memoryCache: Artwork[] = [];
const deletedArtworksMemory = new Set<string>();
const artworkOverridesMemory = new Map<string, Partial<Artwork>>();
const deletedProfilesMemory = new Set<string>();
const profileOverridesMemory = new Map<string, Partial<Artist>>();

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

/**
 * Returns set of deleted artwork IDs (moderated by Master)
 */
export async function getDeletedArtworkIds(): Promise<Set<string>> {
  try {
    const raw = await readFile(DELETED_ARTWORKS_FILE, "utf-8");
    if (!raw.trim()) return deletedArtworksMemory;
    const list = JSON.parse(raw);
    if (Array.isArray(list)) {
      list.forEach((id: string) => deletedArtworksMemory.add(id));
    }
    return deletedArtworksMemory;
  } catch {
    return deletedArtworksMemory;
  }
}

/**
 * Marks an artwork as permanently deleted (accessible by Master)
 */
export async function markArtworkDeleted(artworkId: string): Promise<void> {
  deletedArtworksMemory.add(artworkId);
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(
      DELETED_ARTWORKS_FILE,
      JSON.stringify(Array.from(deletedArtworksMemory), null, 2),
      "utf-8"
    );
  } catch (err) {
    console.warn("[ARTIQ] Could not persist deleted-artworks.json:", err);
  }
  await removeLocalArtworkFile(artworkId);
}

/**
 * Retrieves master artwork overrides (title, description, tags, etc.)
 */
export async function getArtworkOverrides(): Promise<Map<string, Partial<Artwork>>> {
  try {
    const raw = await readFile(ARTWORK_OVERRIDES_FILE, "utf-8");
    if (!raw.trim()) return artworkOverridesMemory;
    const parsed = JSON.parse(raw) as Record<string, Partial<Artwork>>;
    if (parsed && typeof parsed === "object") {
      Object.entries(parsed).forEach(([id, override]) => {
        artworkOverridesMemory.set(id, override);
      });
    }
    return artworkOverridesMemory;
  } catch {
    return artworkOverridesMemory;
  }
}

/**
 * Saves a master override for an artwork
 */
export async function saveArtworkOverride(
  artworkId: string,
  data: Partial<Artwork>
): Promise<void> {
  const current = artworkOverridesMemory.get(artworkId) || {};
  artworkOverridesMemory.set(artworkId, { ...current, ...data });

  try {
    await mkdir(DATA_DIR, { recursive: true });
    const obj: Record<string, Partial<Artwork>> = {};
    artworkOverridesMemory.forEach((val, key) => {
      obj[key] = val;
    });
    await writeFile(ARTWORK_OVERRIDES_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.warn("[ARTIQ] Could not persist artwork-overrides.json:", err);
  }
}

/**
 * Returns set of deleted profile usernames (moderated by Master)
 */
export async function getDeletedProfileUsernames(): Promise<Set<string>> {
  try {
    const raw = await readFile(DELETED_PROFILES_FILE, "utf-8");
    if (!raw.trim()) return deletedProfilesMemory;
    const list = JSON.parse(raw);
    if (Array.isArray(list)) {
      list.forEach((u: string) => deletedProfilesMemory.add(u.toLowerCase()));
    }
    return deletedProfilesMemory;
  } catch {
    return deletedProfilesMemory;
  }
}

/**
 * Marks a profile as permanently deleted/removed by Master
 */
export async function markProfileDeleted(username: string): Promise<void> {
  deletedProfilesMemory.add(username.toLowerCase());
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(
      DELETED_PROFILES_FILE,
      JSON.stringify(Array.from(deletedProfilesMemory), null, 2),
      "utf-8"
    );
  } catch (err) {
    console.warn("[ARTIQ] Could not persist deleted-profiles.json:", err);
  }
}

/**
 * Retrieves master profile overrides
 */
export async function getProfileOverrides(): Promise<Map<string, Partial<Artist>>> {
  try {
    const raw = await readFile(PROFILE_OVERRIDES_FILE, "utf-8");
    if (!raw.trim()) return profileOverridesMemory;
    const parsed = JSON.parse(raw) as Record<string, Partial<Artist>>;
    if (parsed && typeof parsed === "object") {
      Object.entries(parsed).forEach(([username, override]) => {
        profileOverridesMemory.set(username.toLowerCase(), override);
      });
    }
    return profileOverridesMemory;
  } catch {
    return profileOverridesMemory;
  }
}

/**
 * Saves a master override for an artist profile
 */
export async function saveProfileOverride(
  username: string,
  data: Partial<Artist>
): Promise<void> {
  const key = username.toLowerCase();
  const current = profileOverridesMemory.get(key) || {};
  profileOverridesMemory.set(key, { ...current, ...data });

  try {
    await mkdir(DATA_DIR, { recursive: true });
    const obj: Record<string, Partial<Artist>> = {};
    profileOverridesMemory.forEach((val, k) => {
      obj[k] = val;
    });
    await writeFile(PROFILE_OVERRIDES_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (err) {
    console.warn("[ARTIQ] Could not persist profile-overrides.json:", err);
  }
}

