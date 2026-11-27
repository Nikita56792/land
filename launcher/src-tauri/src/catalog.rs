use serde::{Deserialize, Serialize};
use std::time::Duration;

const EMBEDDED_CATALOG_JSON: &str = include_str!("../../../public/launcher-catalog.json");

const CATALOG_URLS: [&str; 2] = [
    "https://parhelio.ru/launcher-catalog.json",
    "https://global.parhelio.ru/launcher-catalog.json",
];

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Catalog {
    pub schema_version: u32,
    pub updated_at: String,
    pub mirrors: Vec<MirrorConfig>,
    pub games: Vec<CatalogGame>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MirrorConfig {
    pub id: String,
    pub name: String,
    pub region: String,
    pub base_url: String,
    pub ping_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogGame {
    pub id: String,
    pub slug: String,
    pub title: String,
    pub subtitle: String,
    pub version: String,
    pub title_id: String,
    pub status: String,
    pub status_label: String,
    pub accent_hex: String,
    pub cover_url: String,
    pub summary: String,
    pub packages: Vec<CatalogPackage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CatalogPackage {
    pub id: String,
    pub format: String,
    pub label: String,
    pub file_name: String,
    pub size_bytes: u64,
    pub size_label: String,
    pub default_subdir: String,
    #[serde(default)]
    pub wup_folder_name: Option<String>,
    pub install_hint: String,
}

pub fn embedded_catalog() -> Result<Catalog, String> {
    serde_json::from_str::<Catalog>(EMBEDDED_CATALOG_JSON)
        .map_err(|e| format!("Ошибка разбора встроенного каталога: {e}"))
}

pub async fn fetch_catalog() -> Result<Catalog, String> {
    if let Ok(client) = reqwest::Client::builder()
        .timeout(Duration::from_secs(3))
        .connect_timeout(Duration::from_secs(2))
        .user_agent("ParhelioLauncher/1.0")
        .build()
    {
        for url in CATALOG_URLS {
            if let Ok(resp) = client.get(url).send().await {
                if resp.status().is_success() {
                    if let Ok(catalog) = resp.json::<Catalog>().await {
                        if !catalog.games.is_empty() && !catalog.mirrors.is_empty() {
                            return Ok(catalog);
                        }
                    }
                }
            }
        }
    }

    embedded_catalog()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn embedded_catalog_parses_with_mirrors_and_games() {
        let cat = embedded_catalog().expect("embedded catalog should parse");
        assert_eq!(cat.schema_version, 1);
        assert_eq!(cat.mirrors.len(), 2);
        assert!(cat.mirrors.iter().any(|m| m.id == "ru"));
        assert!(cat.mirrors.iter().any(|m| m.id == "global"));
        assert!(cat.games.len() >= 3);

        let mc = cat
            .games
            .iter()
            .find(|g| g.id == "minecraft-wiiu")
            .expect("minecraft should exist");
        assert_eq!(mc.packages.len(), 2);
        assert_eq!(
            mc.packages[1].wup_folder_name.as_deref(),
            Some("Minecraft_WiiU")
        );
    }
}
