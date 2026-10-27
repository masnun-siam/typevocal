# Verify release signatures

Release artifacts carry Tauri updater signatures (minisign, base64-wrapped). The public key is `plugins.updater.pubkey` in `src-tauri/tauri.conf.json`.

> The key is still the placeholder `REPLACE_WITH_TYPEVOCAL_MINISIGN_PUBLIC_KEY` until the first signed release; nothing can be verified before then.

1. Save the `pubkey` value to `typevocal.pub.b64` and download the artifact and its `.sig` file.
2. Decode both and verify:

```bash
ARTIFACT="TypeVocal_<version>_amd64.AppImage"

python3 - "$ARTIFACT" <<'PY'
import base64, pathlib, sys
artifact = sys.argv[1]
pathlib.Path("typevocal.pub").write_bytes(base64.b64decode(pathlib.Path("typevocal.pub.b64").read_text().strip()))
pathlib.Path(f"{artifact}.minisig").write_bytes(base64.b64decode(pathlib.Path(f"{artifact}.sig").read_text().strip()))
PY

minisign -Vm "$ARTIFACT" -p typevocal.pub -x "$ARTIFACT.minisig"
```

Success prints `Signature and comment signature verified`. Do not use `gpg` for these files.
