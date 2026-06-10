from __future__ import annotations

import json
import os
from dataclasses import dataclass, asdict
from pathlib import Path


_TRACELLM_HOME = Path(os.getenv("TRACELLM_HOME", str(Path.home() / ".tracellm")))
_CONFIG_PATH = _TRACELLM_HOME / "config.json"
_THEMES_DIR = _TRACELLM_HOME / "themes"


@dataclass
class Theme:
    name: str
    primary: str = "bold white"
    secondary: str = "bright_black"
    success: str = "green"
    warning: str = "yellow"
    error: str = "red"
    info: str = "cyan"
    border: str = "bright_black"
    accent: str = "bold white"

    def style(self, key: str) -> str:
        return getattr(self, key, "white")


_BUILTIN_THEMES: dict[str, Theme] = {
    "dark": Theme("dark"),
    "light": Theme(
        name="light",
        primary="bold #1a1a1a",
        secondary="#666666",
        success="bold green",
        warning="bold #b8860b",
        error="bold red",
        info="#0066cc",
        border="#cccccc",
        accent="bold #1a1a1a",
    ),
    "matrix": Theme(
        name="matrix",
        primary="bold #00ff00",
        secondary="#005500",
        success="bold #00ff00",
        warning="bold #ffff00",
        error="bold #ff0000",
        info="#00cc00",
        border="#003300",
        accent="bold #00ff00",
    ),
    "dracula": Theme(
        name="dracula",
        primary="bold #f8f8f2",
        secondary="#6272a4",
        success="#50fa7b",
        warning="#f1fa8c",
        error="#ff5555",
        info="#8be9fd",
        border="#44475a",
        accent="bold #ff79c6",
    ),
    "nord": Theme(
        name="nord",
        primary="bold #eceff4",
        secondary="#616e88",
        success="#a3be8c",
        warning="#ebcb8b",
        error="#bf616a",
        info="#88c0d0",
        border="#434c5e",
        accent="bold #b48ead",
    ),
    "retro": Theme(
        name="retro",
        primary="bold #ffb000",
        secondary="#8b6000",
        success="#ffb000",
        warning="#ff8c00",
        error="#ff4500",
        info="#ffcc00",
        border="#5a3a00",
        accent="bold #ffb000",
    ),
    "purple": Theme(
        name="purple",
        primary="bold white",
        secondary="#b388ff",
        success="#69f0ae",
        warning="#ffd740",
        error="#ff5252",
        info="#82b1ff",
        border="#7c4dff",
        accent="bold #e040fb",
    ),
}


def _load_config() -> dict:
    if _CONFIG_PATH.exists():
        try:
            return json.loads(_CONFIG_PATH.read_text())
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def _save_config(data: dict) -> None:
    _TRACELLM_HOME.mkdir(parents=True, exist_ok=True)
    _CONFIG_PATH.write_text(json.dumps(data, indent=2) + "\n")


def get_current_theme_name() -> str:
    return _load_config().get("theme", "dark")


def set_current_theme(name: str) -> None:
    data = _load_config()
    data["theme"] = name
    _save_config(data)
    _clear_cache()


def get_theme(name: str) -> Theme | None:
    if name in _BUILTIN_THEMES:
        return _BUILTIN_THEMES[name]
    return _load_custom_theme(name)


def get_available_themes() -> list[str]:
    return list(_BUILTIN_THEMES.keys()) + _list_custom_themes()


def _load_custom_theme(name: str) -> Theme | None:
    path = _THEMES_DIR / f"{name}.json"
    if path.exists():
        try:
            data = json.loads(path.read_text())
            return Theme(name=name, **{k: v for k, v in data.items() if k != "name"})
        except (json.JSONDecodeError, OSError):
            pass
    return None


def _list_custom_themes() -> list[str]:
    if not _THEMES_DIR.exists():
        return []
    return sorted(p.stem for p in _THEMES_DIR.iterdir() if p.suffix == ".json")


def save_custom_theme(name: str, theme_data: dict) -> None:
    _THEMES_DIR.mkdir(parents=True, exist_ok=True)
    path = _THEMES_DIR / f"{name}.json"
    path.write_text(json.dumps(theme_data, indent=2) + "\n")


_current_theme: Theme | None = None


def current_theme() -> Theme:
    global _current_theme
    if _current_theme is None:
        name = get_current_theme_name()
        theme = get_theme(name)
        if theme is None:
            theme = _BUILTIN_THEMES["dark"]
            set_current_theme("dark")
        _current_theme = theme
    return _current_theme


def _clear_cache() -> None:
    global _current_theme
    _current_theme = None


def reset_theme() -> None:
    _clear_cache()
    set_current_theme("dark")


# ── Themed markup helpers ───────────────────────────────────────────────

def _t() -> Theme:
    return current_theme()


def primary(text: str = "") -> str:
    s = _t().primary
    return f"[{s}]{text}[/]" if text else f"[{s}]"


def secondary(text: str = "") -> str:
    s = _t().secondary
    return f"[{s}]{text}[/]" if text else f"[{s}]"


def success(text: str = "") -> str:
    s = _t().success
    return f"[{s}]{text}[/]" if text else f"[{s}]"


def warning(text: str = "") -> str:
    s = _t().warning
    return f"[{s}]{text}[/]" if text else f"[{s}]"


def error(text: str = "") -> str:
    s = _t().error
    return f"[{s}]{text}[/]" if text else f"[{s}]"


def info(text: str = "") -> str:
    s = _t().info
    return f"[{s}]{text}[/]" if text else f"[{s}]"


def get_border_style() -> str:
    return _t().border


def accent(text: str = "") -> str:
    s = _t().accent
    return f"[{s}]{text}[/]" if text else f"[{s}]"


def tick() -> str:
    return f"[{_t().success}]✓[/]"


def cross() -> str:
    return f"[{_t().error}]✗[/]"
